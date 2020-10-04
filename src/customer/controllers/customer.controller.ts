import {
    Body, Controller, forwardRef, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, Res, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import * as bCrypt from 'bcrypt';
import * as _ from 'lodash';

import * as fromDto from '../dto';
import { PaginateResult } from 'mongoose';
import * as asyncOperations from 'async';

import * as text from '../constants/en';
import * as swaggerDoc from '../constants/swagger';
import * as utils from '../../_sharedCollections/helpers/utils';

import { ICustomer } from '../interfaces/customer.interface';
import * as fromEnum from '../interfaces/customer.enum';
import { Task } from '../interfaces/customer.enum';
import { CustomerSocket } from '../webSockets/customer-socket';

import { OrganisationService } from '../../organisation/services/organisation.service';
import { ProjectService } from '../../organisation/services/project.service';
import { CustomerService } from '../services/customer.service';

import { IOrganisation } from '../../organisation/interfaces/organisation.interface';
import { IProject } from '../../organisation/interfaces/project.interface';
import { IUserRequest } from '../../utility/interfaces/user-request.interface';
import { IJwtToken, UserType } from '../../auth/interfaces/authUtils';
import { AuthenticationService } from '../../auth/services/authentication.service';
import { JwtAuthGuard, PermissionGuard, Permissions } from '../../auth/guard/permission.guard';



@ApiTags('Customer')
@Controller('customer')
export class CustomerController {


    constructor(private readonly customerService: CustomerService,
                private readonly organisationService: OrganisationService,
                private readonly projectService: ProjectService,
                @Inject(forwardRef(() => AuthenticationService)) private authenticationService: AuthenticationService,
                private readonly customerSocket: CustomerSocket) {
    }


    private sendEmailVerificationWithCode = (customerObject: ICustomer, code: number): Promise<any> => {

        return this.customerService.sendEmailVerification(customerObject, code);
    };


    private checkUserProfileVerificationStatus = async (email: string, verificationCode: number): Promise<any> => {

        try {

            const userProfile: ICustomer = await this.customerService.getSingleCustomer({ email });

            if (!userProfile.profileStatus.isVerified) {

                const emailResponse = this.sendEmailVerificationWithCode(userProfile, verificationCode);
                const updatedCodeResponse = this.customerService.updateVerificationCode(userProfile._id, verificationCode);

                return await Promise.all([emailResponse, updatedCodeResponse]);

            } else {

                return null;
            }

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    };


    private interestBasedOrganisations = async (interests: string[], paging: any): Promise<any> => {

        try {

            const organisationProfileList: PaginateResult<IOrganisation> = await this.organisationService.getOrganisationByInterests(interests, paging);

            if (!organisationProfileList.docs.length) {
                return {
                    status: true,
                    message: text.NO_INTEREST_BASED_ORGANISATION,
                    response: organisationProfileList,
                };
            }

            return {
                status: true,
                message: text.INTEREST_BASED_ORGANISATION_RETRIEVED,
                response: organisationProfileList,
            };

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    };


    private interestBasedProjects = async (interests: string[], paging: any): Promise<any> => {

        try {

            const projectProfileList: PaginateResult<IProject> = await this.projectService.getProjectsByInterest(interests, paging);

            if (!projectProfileList.docs.length) {
                return { status: true, message: text.NO_INTEREST_BASED_PROJECT, response: projectProfileList };
            }

            return { status: true, message: text.INTEREST_BASED_PROJECT_RETRIEVED, response: projectProfileList };

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    };



    // add a customer
    @ApiBody({ required: true, type: fromDto.CreateCustomerDto })
    @ApiOperation({ summary: swaggerDoc.CreateCustomer.summary })
    @ApiResponse({ status: 200 })
    @Post('create')
    public async addNewCustomer(@Body() customerDto: fromDto.CreateCustomerDto, @Res() response: Response): Promise<any> {

        const hashedPassword = await bCrypt.hash(customerDto.password, 10);
        const verificationCode: number = utils.generateRandomNumber(1000, 9000);

        try {

            const isUserExist: boolean = !!(await this.customerService.getSingleCustomer({ email: customerDto.email }));

            if (isUserExist) {

                let responseObject: any = { status: false, message: text.CUSTOMER_ALREADY_EXIST, response: null };
                const profileStatus = (await this.checkUserProfileVerificationStatus(customerDto.email, verificationCode));

                if (profileStatus) {
                    responseObject = {
                        ...responseObject,
                        message: text.PROFILE_EXIST_NOT_VERIFIED,
                        response: 'NOT_VERIFIED',
                    };
                }
                return response.status(HttpStatus.BAD_REQUEST).jsonp(responseObject);
            }

            const customerObject: ICustomer = (await this.customerService.addCustomer({
                ...customerDto,
                password: hashedPassword,
            }));
            const emailResponse = this.sendEmailVerificationWithCode(customerObject, verificationCode);
            const updatedCodeResponse = this.customerService.updateVerificationCode(customerObject._id, verificationCode);

            const finalResponse = (await Promise.all([emailResponse, updatedCodeResponse]));
            this.customerSocket.newAccountCreated(_.omit(customerObject, 'password'));

            console.log(finalResponse);

            return response.status(HttpStatus.CREATED)
                .jsonp(
                    {
                        status: true,
                        message: text.CUSTOMER_CREATED_SUCCESS,
                        response: _.omit(customerObject, 'password'),
                    },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.CUSTOMER_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // update existing customer
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.CUSTOMER)
    @ApiBearerAuth()
    @ApiBody({ required: true, type: fromDto.UpdateCustomerDto })
    @ApiOperation({ summary: swaggerDoc.UpdateCustomer.summary })
    @ApiParam({ name: 'id', required: true })
    @ApiResponse({ status: 200 })
    @Put('update/:id')
    public async updateExistingCustomer(@Body() updateDto: fromDto.UpdateCustomerDto, @Res() response: Response, @Param() requestParam: { id: string }): Promise<any> {

        try {

            const isUserValid: boolean = !!(await this.customerService.getCustomerById(requestParam.id));

            if (!isUserValid) {

                return response.status(HttpStatus.BAD_REQUEST)
                    .jsonp({ status: true, message: text.CUSTOMER_NOT_EXIST, response: null });
            }

            const updatedProfile: ICustomer = await this.customerService.updateCustomerById(requestParam.id, updateDto);

            return response.status(HttpStatus.CREATED)
                .jsonp(
                    {
                        status: true,
                        message: text.CUSTOMER_UPDATED_SUCCESS,
                        response: _.omit(updatedProfile, 'password'),
                    },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.CUSTOMER_UPDATED_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // confirm verification code
    @ApiBody({ type: fromDto.UpdateVerificationCodeDto, required: true })
    @ApiParam({ name: 'id', required: true })
    @ApiOperation({ summary: swaggerDoc.ConfirmVerification.summary })
    @ApiResponse({ status: 200 })
    @Put('confirmVerificationCode/:id')
    public async confirmVerificationCode(@Body() requestBody: fromDto.UpdateVerificationCodeDto, @Res() response: Response, @Param() requestParameter: { id: string }): Promise<any> {

        try {

            const customerProfile: ICustomer = (await this.customerService.getCustomerById(requestParameter.id));

            if (customerProfile.verificationCode !== requestBody.verificationCode) {

                return response.status(HttpStatus.OK)
                    .jsonp(
                        { status: false, message: text.INVALID_VERIFICATION_CODE, response: null },
                    );
            }

            const updatedCodeResponse: ICustomer = await this.customerService.updateCustomerById(
                customerProfile._id,
                <fromDto.UpdateProfileStatusAndVerificationDto>{
                    profileStatus: { ...customerProfile.profileStatus, isVerified: true }, verificationCode: null,
                },
            );

            this.customerSocket.transmitVerificationStatus(_.omit(updatedCodeResponse, 'password'), true);
            const jwtTokenObject: IJwtToken = this.authenticationService.loginUser(customerProfile, 'customer');

            return response.status(HttpStatus.ACCEPTED)
                .jsonp(
                    { status: true, message: text.VERIFICATION_CODE_CONFIRM_SUCCESS, jwtTokenObject, _id: customerProfile._id },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.VERIFICATION_CODE_CONFIRM_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // send verification code
    @ApiParam({ name: 'id', required: true })
    @ApiOperation({ summary: swaggerDoc.ResendCode.summary })
    @ApiResponse({ status: 200 })
    @Get('resendCode/:id')
    public async resendVerificationCode(@Param() requestParameter: { id: string }, @Res() response: Response): Promise<any> {

        const verificationCode: number = utils.generateRandomNumber(1000, 9000);

        try {

            const customerObject: ICustomer = (await this.customerService.getCustomerById(requestParameter.id));

            if (!customerObject) {

                return response.status(HttpStatus.BAD_REQUEST)
                    .jsonp(
                        { status: false, message: text.CUSTOMER_NOT_EXIST, response: null },
                    );
            }

            const updatedCodeResponse = this.customerService.updateVerificationCode(customerObject._id, verificationCode);
            const codeResent = this.customerService.resendVerificationCode(customerObject, verificationCode);

            const finalResponse = (await Promise.all([updatedCodeResponse, codeResent]));

            console.log(finalResponse);

            return response.status(HttpStatus.OK)
                .jsonp(
                    { status: true, message: text.VERIFICATION_CODE_RESENT_SUCCESS, response: _.omit(customerObject, 'password'), },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.VERIFICATION_CODE_RESENT_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }



    // get customer list by pagination
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.CUSTOMER)
    @ApiOperation({ summary: swaggerDoc.RecommendationList.summary })
    @ApiResponse({ status: 200 })
    @ApiParam({ name: 'id', required: true })
    @Get('getRecommendations/:id')
    public async getRecommendations(@Param() requestParameter: { id: string }, @Res() response: Response): Promise<any> {

        try {

            const { interests, projectsLiked: likedProjects, favouriteProjects }: ICustomer = (await this.customerService.populateCustomer(requestParameter.id));

            const { response: recommendedOrganisations }: { status: boolean, message: string, response: PaginateResult<IOrganisation> } = (
                await this.interestBasedOrganisations(interests, {})
            );

            const { response: recommendedProjects }: { status: boolean, message: string, response: PaginateResult<IProject> } = (
                await this.interestBasedProjects(interests, {})
            );

            const result = { likedProjects, favouriteProjects, recommendedProjects, recommendedOrganisations };

            return response.status(HttpStatus.OK)
                .jsonp({ status: true, message: text.RECOMMENDATION_SUCCESS, result });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // get customer list by pagination
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.CUSTOMER)
    @ApiBearerAuth()
    @ApiOperation({ summary: swaggerDoc.RecommendedOrganisation.summary })
    @ApiQuery({ name: 'query', type: Object })
    @ApiResponse({ status: 200 })
    @ApiParam({ name: 'id', required: true })
    @Get('recommendedOrganisation/:id')
    public async getRecommendedOrganisation(@Param() requestParameter: { id: string }, @Res() response: Response, @Query() queryReq: any): Promise<any> {

        try {

            const customerProfile: ICustomer = (await this.customerService.getCustomerById(requestParameter.id));

            const organisationResponse = await this.interestBasedOrganisations(customerProfile.interests, queryReq);
            return response.status(HttpStatus.OK).jsonp(organisationResponse);

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // get customer list by pagination
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.CUSTOMER)
    @ApiBearerAuth()
    @ApiOperation({ summary: swaggerDoc.RecommendationList.summary })
    @ApiResponse({ status: 200 })
    @ApiQuery({ name: 'query', type: Object })
    @ApiParam({ name: 'id', required: true })
    @Get('recommendedProject/:id')
    public async getRecommendedProjects(@Param() requestParameter: { id: string }, @Res() response: Response, @Query() queryReq: any): Promise<any> {

        try {

            const customerProfile: ICustomer = (await this.customerService.getCustomerById(requestParameter.id));

            const projectResponse = await this.interestBasedProjects(customerProfile.interests, queryReq);
            return response.status(HttpStatus.OK).jsonp(projectResponse);

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // get customer list by pagination
    // @UseGuards(JwtAuthGuard, PermissionGuard)
    // @Permissions(UserType.CUSTOMER)
    @ApiBearerAuth()
    @ApiOperation({ summary: swaggerDoc.SearchProject.summary })
    @ApiQuery({ name: 'query', type: Object })
    @ApiParam({ name: 'keyword', required: true })
    @Get('search/:keyword')
    public async searchProjects(@Param() requestParameter: { for: string, keyword: string }, @Res() response: Response, @Query() queryReq: any): Promise<any> {

        try {

            const idsOfInterest: string[] = await this.customerService.searchInterests( requestParameter.keyword );

            const projectQuery: any[] = [ {'organisation.interests': { $in: idsOfInterest } }, {description: new RegExp(requestParameter.keyword, 'i') }, {projectName: new RegExp(requestParameter.keyword, 'i')} ];
            const organisationQuery: any[] = [ {interests: { $in: idsOfInterest } }, {organisationName: new RegExp(requestParameter.keyword, 'i')}, {description: new RegExp(requestParameter.keyword, 'i') } ];

            const projects = (cb) => this.projectService.searchProject( projectQuery, queryReq).then( (result) => cb(null, result) ).catch( error => cb(error, null));
            const organisations = (cb) => this.organisationService.searchOrganisation(organisationQuery, queryReq).then( r => cb(null, r)).catch( err => cb(err, null));


            asyncOperations.parallel({ projects, organisations }, (err, result) => {
                if (err)
                    throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR)

                return response.status(HttpStatus.OK).jsonp({ status: true, result });
            })

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // do like to the project
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.CUSTOMER)
    @ApiBearerAuth()
    @ApiOperation({ summary: swaggerDoc.LikeFavour.summary })
    @ApiResponse({ status: 200 })
    @ApiParam({ name: 'id', required: true })
    @ApiBody({ type: fromDto.UpdateCustomerWithTask, required: true, description: swaggerDoc.LikeFavour.bodyDescription})
    @ApiParam({ name: 'do', required: true, enum: ['like', 'unlike', 'favourite', 'unfavored', 'interest'] })
    @Put('perform/:do/:id')
    public async doLike(@Param() requestParameter: { id: string, do: fromEnum.Task }, @Body() requestBody: fromDto.UpdateCustomerWithTask, @Res() response: Response): Promise<any> {

        try {

            let projectMarking: ICustomer;

            switch (requestParameter.do) {

                case Task.LIKE: {
                    projectMarking = await this.customerService.projectFavourOrLike(requestParameter.id, requestBody.listOfIds, 'projectsLiked');
                    break;
                }

                case Task.UNLIKE: {
                    projectMarking = await this.customerService.projectUnfavouredOrUnlike(requestParameter.id, requestBody.listOfIds, 'projectsLiked');
                    break;
                }

                case Task.FAVORITE: {
                    projectMarking = await this.customerService.projectFavourOrLike(requestParameter.id, requestBody.listOfIds, 'favouriteProjects');
                    break;
                }

                case Task.UNFAVOURED: {
                    projectMarking = await this.customerService.projectUnfavouredOrUnlike(requestParameter.id, requestBody.listOfIds, 'favouriteProjects');
                    break;
                }

                case Task.INTEREST: {
                    projectMarking = await this.customerService.saveInterests(requestParameter.id, requestBody.listOfIds);
                    break;
                }

                default: {
                    return new HttpException(text.UNKNOWN_REQUEST, HttpStatus.BAD_REQUEST);
                }
            }

            if ([Task.UNLIKE, Task.LIKE].includes(requestParameter.do)) {
                await this.projectService.increaseDecreaseLikes(requestBody.listOfIds, requestParameter.do === 'like');
            }

            const updatedCustomerObject: ICustomer = await this.customerService.getCustomerById(projectMarking._id);

            return response.status(HttpStatus.OK)
                .jsonp({
                    status: true,
                    message: _.replace(text.PROJECT_LIKE_SUCCESS, '%s', requestParameter.do),
                    response: _.omit(updatedCustomerObject, ['password']),
                });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.PROJECT_LIKE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // get customer list by pagination
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN, UserType.CUSTOMER)
    @ApiParam({ name: 'id', required: true })
    @ApiOperation({ summary: swaggerDoc.CustomerProfile.summary })
    @ApiResponse({ status: 200 })
    @Get('profile/:id')
    public async getCustomerProfile(@Param() reqParam: { id: string }, @Res() response: Response): Promise<any> {

        try {

            const customerProfile: ICustomer = await this.customerService.getCustomerById(reqParam.id);

            return response.status(HttpStatus.OK)
                .jsonp({ status: true, message: text.CUSTOMER_PROFILE_SUCCESS, response: customerProfile });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.CUSTOMER_PROFILE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // submit user request for customer
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.CUSTOMER)
    @ApiBearerAuth()
    @ApiOperation({ summary: swaggerDoc.UserRequest.summary })
    @ApiResponse({ status: 200 })
    @ApiParam({ name: 'id', required: true })
    @ApiBody({ type: fromDto.UserRequestDto, required: true })
    @Post('submitRequest/:id')
    public async submitRequest(@Res() response: Response, @Body() reqBody: fromDto.UserRequestDto, @Param() reqParam: { id: string }): Promise<any> {

        try {

            const requestObject: IUserRequest = await this.customerService.submitUserRequest({
                ...reqBody,
                customer: reqParam.id,
            });

            if (!requestObject) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({
                    status: false,
                    message: text.REQUEST_SUBMIT_FAILED,
                    response: null,
                });
            }

            return response.status(HttpStatus.CREATED).jsonp({
                status: true,
                message: text.REQUEST_SUBMIT_SUCCESS,
                response: requestObject,
            });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.REQUEST_SUBMIT_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }



    private handleErrorLogs = (error: any): void => console.log(error);
}
