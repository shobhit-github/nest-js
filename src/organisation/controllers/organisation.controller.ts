import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    Res,
    Put,
    Param,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Get,
    UseGuards,
} from '@nestjs/common';
import { OrganisationService } from '../services/organisation.service';
import {
    ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiConsumes, ApiBearerAuth, ApiExcludeEndpoint,
} from '@nestjs/swagger';
import * as fromDto from '../dto';
import { Response } from 'express';

import * as fileSystem from 'fs';
import * as _ from 'lodash';
import * as text from '../constants/en';
import * as swaggerDoc from '../constants/swagger';
import { UserType } from '../../auth/interfaces/authUtils';

import * as fileOperations from '../helpers/fileUpload.helper';
import { IOrganisation } from '../interfaces/organisation.interface';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as utils from '../../_sharedCollections/helpers/utils';
import * as bCrypt from 'bcrypt';
import { IUserRequest } from '../../utility/interfaces/user-request.interface';
import { PermissionGuard, Permissions, JwtAuthGuard } from '../../auth/guard/permission.guard';


@ApiTags('Organisation')
@Controller('organisation')
export class OrganisationController {


    constructor(private readonly organisationService: OrganisationService) {
    }


    // add an organisation
    @ApiBody({ required: true, type: fromDto.CreateOrganisationDto })
    @ApiOperation({ summary: swaggerDoc.CreateOrganisation.summary })
    @ApiResponse({ status: 200 })
    @Post('create')
    public async addNewOrganisation(@Body() organisationDto: fromDto.CreateOrganisationDto, @Res() response: Response): Promise<any> {

        try {

            const isOrganisationExist: boolean = !!(await this.organisationService.getSingleOrganisation({ email: organisationDto.email }));

            if (isOrganisationExist) {

                return response.status(HttpStatus.NOT_ACCEPTABLE)
                    .jsonp(
                        { status: false, message: text.ORGANISATION_ALREADY_EXIST, response: null },
                    );
            }

            const organisationObject: IOrganisation = (await this.organisationService.addOrganisation(organisationDto));


            return response.status(HttpStatus.CREATED)
                .jsonp({
                    status: true,
                    message: text.ORGANISATION_CREATED_SUCCESS,
                    response: _.omit(organisationObject, 'password'),
                });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // add an organisation
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ORGANISATION)
    @ApiBody({ required: true, type: fromDto.CreateOrganisationDto })
    @ApiOperation({ summary: swaggerDoc.UpdateOrganisation.summary })
    @ApiParam({ name: 'id', required: true })
    @ApiResponse({ status: 200 })
    @Put('update/:id')
    public async updateOrganisation(@Param() reqParam: { id: string }, @Body() organisationDto: fromDto.CreateOrganisationDto, @Res() response: Response): Promise<any> {

        try {

            const isValidOrg: boolean = !!(await this.organisationService.getOrganisationById(reqParam.id));

            if (!isValidOrg) {

                return response.status(HttpStatus.BAD_REQUEST)
                    .jsonp({ status: false, message: text.ORGANISATION_NOT_EXIST, response: null });
            }

            const organisationObject: IOrganisation = (await this.organisationService.updateOrganisationById(reqParam.id, organisationDto));


            return response.status(HttpStatus.OK)
                .jsonp({
                    status: true,
                    message: text.ORGANISATION_UPDATED_SUCCESS,
                    response: _.omit(organisationObject, ['password']),
                });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // upload organisation logo
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: swaggerDoc.ApproveProfile.summary })
    @ApiResponse({ status: 200 })
    @Get('verify/:id')
    public async approveOrganisationProfile(@Res() response: Response, @Param() requestParameter: { id: string }): Promise<any> {

        try {

            const generatedPassword: string = utils.generateRandomString(7);
            const hashedPassword: string = await bCrypt.hash(generatedPassword, 10);


            const organisationProfile: IOrganisation = (await this.organisationService.updateOrganisationById(requestParameter.id, { password: hashedPassword }));
            await this.organisationService.sendCredentials(organisationProfile, generatedPassword);


            return response.status(HttpStatus.CREATED)
                .jsonp({ status: true, message: text.PROFILE_APPROVED_SUCCESS });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.PROFILE_APPROVED_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // complete organisation profile
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ORGANISATION)
    @UseInterceptors(FilesInterceptor('pictures', 20, {
        storage: fileOperations.pictureDiskStorage,
        fileFilter: fileOperations.pictureFileFilter,
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ required: true, type: fromDto.CreateOrganisationProfileDto })
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: swaggerDoc.CompleteProfile.summary })
    @ApiResponse({ status: 200 })
    @Put('completeProfile/:id')
    public async completeOrganisationProfile(@Body() organisationDto: fromDto.CreateOrganisationProfileDto, @Res() response: Response, @Param() requestParameter: { id: string }, @UploadedFiles() files: any[]): Promise<any> {

        try {

            const pictures: string[] = files.map(file => file.path);
            const { description, organisationName } = organisationDto;
            const interests: string[] = organisationDto.interests.split(',');


            const updateOrganisationProfile: IOrganisation = await this.organisationService.updateOrganisationById(requestParameter.id, {
                pictures,
                interests,
                description,
                organisationName,
            });

            return response.status(HttpStatus.CREATED)
                .jsonp(
                    { status: true, message: text.ORGANISATION_CREATED_SUCCESS, response: updateOrganisationProfile },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // upload organisation logo
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ORGANISATION)
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: swaggerDoc.UploadLogo.summary })
    @ApiResponse({ status: 200 })
    @UseInterceptors(FileInterceptor('logo', {
        storage: fileOperations.logoDiskStorage,
        fileFilter: fileOperations.logoFileFilter,
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: fromDto.UpdateOrganisationLogoDto, required: true })
    @Put('updateLogo/:id')
    public async updateLogo(@UploadedFile() file: any, @Res() response: Response, @Param() requestParameter: { id: string }): Promise<any> {

        try {

            const organisationProfile = await this.organisationService.getOrganisationById(requestParameter.id);

            console.log(typeof file, file);

            if (fileSystem.existsSync(organisationProfile.organisationLogo)) {
                fileSystem.unlinkSync(organisationProfile.organisationLogo);
            }

            const updateOrganisationLogo = await this.organisationService.updateOrganisationById(requestParameter.id, { organisationLogo: file.path });

            return response.status(HttpStatus.CREATED)
                .jsonp(
                    { status: true, message: text.ORGANISATION_CREATED_SUCCESS, response: updateOrganisationLogo },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // upload organisation logo
    @ApiExcludeEndpoint(false)
    // @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard, PermissionGuard)
    // @Permissions(UserType.ORGANISATION)
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: 'Set up bank' })
    @ApiResponse({ status: 200 })
    @Post('setUpBankAccount/:id')
    public async createAccountHolder(@Res() response: Response, @Param() requestParameter: { id: string }): Promise<any> {

        try {

            const createdAccountHolder = await this.organisationService.createAccountHolder({
                "accountHolderCode": requestParameter.id,
                "accountHolderDetails":{
                    "address": {
                        "country": "US"
                    },
                    "email":"test@adyen.com",
                    "individualDetails":{
                        "name":{
                            "firstName":"First name",
                            "gender":"MALE",
                            "lastName":"Last Name"
                        }
                    }
                },
                "createDefaultAccount":true,
                "legalEntity":"Individual"
            });

            // console.log(createdAccountHolder)
            return response.status(HttpStatus.OK).jsonp(createdAccountHolder);

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // submit user request for customer
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ORGANISATION)
    @ApiOperation({ summary: swaggerDoc.UserRequest.summary })
    @ApiResponse({ status: 200 })
    @ApiBody({ type: fromDto.UserRequestDto, required: true })
    @ApiParam({ name: 'id', required: true })
    @Post('submitRequest/:id')
    public async submitRequest(@Res() response: Response, @Body() reqBody: fromDto.UserRequestDto, @Param() reqParam: { id: string }): Promise<any> {

        try {

            const requestObject: IUserRequest = await this.organisationService.submitUserRequest({
                ...reqBody,
                organisation: reqParam.id,
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


    // get organisation profile
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ORGANISATION, UserType.ADMIN)
    @ApiOperation({ summary: swaggerDoc.OrgProfile.summary })
    @ApiResponse({ status: 200 })
    @ApiParam({ name: 'id', required: true })
    @Get('profile/:id')
    public async getOrganisationProfile(@Res() response: Response, @Param() reqParam: { id: string }): Promise<any> {

        try {

            const organisationProfile: IOrganisation = await this.organisationService.getOrganisationById(reqParam.id);

            if (!organisationProfile) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({
                    status: false,
                    message: text.ORG_PROFILE_FAILED,
                    response: null,
                });
            }

            return response.status(HttpStatus.CREATED).jsonp({
                status: true,
                message: text.ORG_PROFILE_SUCCESS,
                response: organisationProfile,
            });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORG_PROFILE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    private handleErrorLogs = (error: any): void => console.log(error);
}
