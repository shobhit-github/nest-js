import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import * as bCrypt from 'bcrypt';
import * as _ from 'lodash';

import * as fromDto from '../dto';
import { PaginateResult } from 'mongoose';

import * as text from '../constants/en';
import * as utils from '../../_sharedCollections/helpers/utils';

import { ICustomer } from '../interfaces/customer.interface';
import * as fromEnum from '../interfaces/customer.enum';
import { Task } from '../interfaces/customer.enum';
import { CustomerSocket } from '../webSockets/customer-socket';

import { OrganisationService } from '../../organisation/services/organisation.service';
import { ProjectService } from '../../organisation/services/project.service';
import { CustomerService } from '../services/customer.service';

import {waterfall} from 'async';
import { IOrganisation } from '../../organisation/interfaces/organisation.interface';
import { IProject } from '../../organisation/interfaces/project.interface';


@ApiTags('Customer')
@Controller('customer')
export class CustomerController {


    constructor(private readonly customerService: CustomerService,
                private readonly organisationService: OrganisationService,
                private readonly projectService: ProjectService,
                private readonly customerSocket: CustomerSocket) {
    }



    private sendEmailVerificationWithCode = (customerObject: ICustomer, code: number) : Promise<any> => {

        return this.customerService.sendEmailVerification(customerObject, code)
    };


    private checkUserProfileVerificationStatus = async (email: string, verificationCode: number): Promise<any> => {

        try {

            const userProfile: ICustomer = await this.customerService.getSingleCustomer({email});

            if ( !userProfile.profileStatus.isVerified ) {

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

    }



    // add a customer
    @ApiBody({required: true, type: fromDto.CreateCustomerDto})
    @ApiOperation({summary: 'Create a new customer for new donations'})
    @ApiResponse({ status: 200 })
    @Post('create')
    public async addNewCustomer(@Body() customerDto: fromDto.CreateCustomerDto, @Res() response: Response): Promise<any> {

        const hashedPassword = await bCrypt.hash(customerDto.password, 10);
        const verificationCode: number = utils.generateRandomNumber(1000, 9000);

        try {

            const isUserExist: boolean = !!( await this.customerService.getSingleCustomer({email: customerDto.email}) );

            if ( isUserExist ) {

                let responseObject: any = { status: false, message: text.CUSTOMER_ALREADY_EXIST, response: null};
                const profileStatus = (await this.checkUserProfileVerificationStatus(customerDto.email, verificationCode) );

                if ( profileStatus ) {
                    responseObject = {...responseObject, message: text.PROFILE_EXIST_NOT_VERIFIED, response: 'NOT_VERIFIED'}
                }
                return response.status(HttpStatus.BAD_REQUEST).jsonp( responseObject );
            }

            const customerObject: ICustomer = ( await this.customerService.addCustomer( { ...customerDto, password: hashedPassword } ) );
            const emailResponse = this.sendEmailVerificationWithCode(customerObject, verificationCode);
            const updatedCodeResponse = this.customerService.updateVerificationCode(customerObject._id, verificationCode);

            const finalResponse = ( await Promise.all([emailResponse, updatedCodeResponse]) );
            this.customerSocket.newAccountCreated(_.omit(customerObject, 'password'));

            console.log(finalResponse)

            return response.status(HttpStatus.CREATED)
                .jsonp(
                    { status: true, message: text.CUSTOMER_CREATED_SUCCESS, response: _.omit(customerObject, 'password')}
                )

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.CUSTOMER_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }




    // confirm verification code
    @ApiBody({type: fromDto.UpdateVerificationCodeDto, required: true})
    @ApiParam({name: 'id', required: true})
    @ApiOperation({summary: 'Verification code confirmation help to go head in the app'})
    @ApiResponse({ status: 200 })
    @Put('confirmVerificationCode/:id')
    public async confirmVerificationCode(@Body() requestBody: fromDto.UpdateVerificationCodeDto, @Res() response: Response, @Param() requestParameter: {id: string}): Promise<any> {

        try {

            const customerObject: ICustomer = ( await this.customerService.getCustomerById(requestParameter.id) );

            if ( customerObject.verificationCode !== requestBody.verificationCode ) {

                return response.status(HttpStatus.OK)
                    .jsonp(
                        { status: false, message: text.INVALID_VERIFICATION_CODE, response: null}
                    )
            }

            const updatedCodeResponse: ICustomer = await this.customerService.updateCustomerById(
                customerObject._id,
                <fromDto.UpdateProfileStatusAndVerificationDto>{
                    profileStatus: { ...customerObject.profileStatus, isVerified: true  }, verificationCode: null
                }
            );

            this.customerSocket.transmitVerificationStatus(_.omit(updatedCodeResponse, 'password'), true)

            return response.status(HttpStatus.ACCEPTED)
                .jsonp(
                    { status: true, message: text.VERIFICATION_CODE_CONFIRM_SUCCESS}
                )

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.VERIFICATION_CODE_CONFIRM_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }



    // send verification code
    @ApiParam({name: 'id', required: true})
    @ApiOperation({summary: 'Resend verification code if the code have not received yet'})
    @ApiResponse({ status: 200 })
    @Get('resendCode/:id')
    public async resendVerificationCode(@Param() requestParameter: {id: string}, @Res() response: Response): Promise<any> {

        const verificationCode: number = utils.generateRandomNumber(1000, 9000);

        try {

            const customerObject: ICustomer = ( await this.customerService.getCustomerById(requestParameter.id) );

            if ( !customerObject ) {

                return response.status(HttpStatus.BAD_REQUEST)
                    .jsonp(
                        { status: false, message: text.CUSTOMER_NOT_EXIST, response: null}
                    )
            }

            const updatedCodeResponse = this.customerService.updateVerificationCode(customerObject._id, verificationCode);
            const codeResent = this.customerService.resendVerificationCode(customerObject, verificationCode);

            const finalResponse = ( await Promise.all([updatedCodeResponse, codeResent]) );

            console.log(finalResponse);

            return response.status(HttpStatus.OK)
                .jsonp(
                    { status: true, message: text.VERIFICATION_CODE_RESENT_SUCCESS, response: _.omit(customerObject, 'password')}
                )

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.VERIFICATION_CODE_RESENT_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }




    // get customer list by pagination
    // @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({name: 'query', type: Object})
    @ApiOperation({summary: 'Retrieve customer data list with paginated format'})
    @ApiResponse({ status: 200 })
    @Get('listCustomer')
    public async getCustomers(@Query() requestQuery: any, @Res() response: Response): Promise<any> {

        try {

            const listCustomer: PaginateResult<ICustomer> = await this.customerService.getAllCustomer(requestQuery.query, requestQuery);

            response.status(HttpStatus.OK)
                .jsonp({status: true, message: text.LIST_CUSTOMER_SUCCESS, response: listCustomer})

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // get customer list by pagination
    // @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: 'Update and Retrieve project and organisation recommendation with the help of customer interests'})
    @ApiResponse({ status: 200 })
    @ApiParam({name: 'id', required: true})
    @Get('getRecommendations/:id')
    public async getRecommendations(@Param() requestParameter: {id: string}, @Res() response: Response): Promise<any> {

        const arrayOfIds: string[] = [];

        try {

            const customerProfile: ICustomer = ( await this.customerService.populateCustomer (requestParameter.id) )
            const organisationProfileList: IOrganisation[] = await this.organisationService.getOrganisationByInterests(customerProfile.interests);

            organisationProfileList.forEach( value => arrayOfIds.push(value._id) );
            const projectDetail: IProject[] = ( await this.projectService.getAllProjects({organisation: {$in: arrayOfIds}}) );


            const result = { allLikedProjects: customerProfile.projectsLiked, allFavouriteProjects: customerProfile.favouriteProjects,
                organisationProfiles: organisationProfileList, interestBasedProjects: projectDetail };

            response.status(HttpStatus.OK)
                .jsonp({status: true, message: text.LIST_CUSTOMER_SUCCESS, response: result})

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // do like to the project
    // @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: 'This api will help to make like, unlike, bookmark and unbooked to a particular project by the customer'})
    @ApiResponse({ status: 200 })
    @ApiParam({name: 'id', required: true})
    @ApiBody({type: fromDto.UpdateCustomerWithTask, required: true, description: 'This API can perform many tasks ( for-example: like, unlike, favourite, unfavoured project and save interest as well). Here you will have to use the project Ids for like, unlike, favourite, unfavoured tasks and use category ids for interest task'})
    @ApiParam({name: 'do', required: true, enum: ['like', 'unlike', 'favourite', 'unfavored', 'interest']})
    @Put('perform/:do/:id')
    public async doLike(@Param() requestParameter: {id: string, do: fromEnum.Task}, @Body() requestBody: fromDto.UpdateCustomerWithTask, @Res() response: Response): Promise<any> {

        try {

            let projectMarking: ICustomer;

            switch (requestParameter.do) {

                case Task.LIKE: {
                    projectMarking = await this.customerService.projectFavourOrLike(requestParameter.id, requestBody.listOfIds, 'projectsLiked'); break;
                }

                case Task.UNLIKE: {
                    projectMarking =  await this.customerService.projectUnfavouredOrUnlike(requestParameter.id, requestBody.listOfIds, 'projectsLiked'); break;
                }

                case Task.FAVORITE: {
                    projectMarking = await this.customerService.projectFavourOrLike(requestParameter.id, requestBody.listOfIds, 'favouriteProjects'); break;
                }

                case Task.UNFAVOURED: {
                    projectMarking = await this.customerService.projectUnfavouredOrUnlike(requestParameter.id, requestBody.listOfIds, 'favouriteProjects'); break;
                }

                case Task.INTEREST: {
                    projectMarking = await this.customerService.saveInterests(requestParameter.id, requestBody.listOfIds); break;
                }

                default: {
                    return new HttpException(text.UNKNOWN_REQUEST, HttpStatus.BAD_REQUEST);
                }
            }

            if ( [Task.UNLIKE, Task.LIKE].includes( requestParameter.do) ) {
                await this.projectService.increaseDecreaseLikes( requestBody.listOfIds, requestParameter.do === 'like' );
            }

            const updatedCustomerObject: ICustomer = await this.customerService.getCustomerById(projectMarking._id);

            return response.status(HttpStatus.OK)
                .jsonp({status: true, message: _.replace( text.PROJECT_LIKE_SUCCESS, '%s', requestParameter.do ), response: _.omit(updatedCustomerObject, ['password'])})

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.PROJECT_LIKE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }







    private handleErrorLogs = (error: any): void => console.log(error)
}
