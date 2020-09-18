import {
    Body, Controller, HttpException, HttpStatus, Post, Res, Get, UseGuards, Req, Put, Param, Query, Patch, Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {Response, Request} from "express";

import * as bCrypt from 'bcrypt'
import * as _ from 'lodash';
import * as fromAdminDto from '../dto';
import * as text from '../constants/en';
import * as swaggerDoc from '../constants/swagger';


import { AdminService } from "../services/admin.service";
import { IAdmin } from "../interfaces/admin.interface";

import { IContent, IFaq } from '../interfaces/content.interface';
import { PermissionGuard, Permissions, JwtAuthGuard  } from '../../auth/guard/permission.guard';
import { UserType } from '../../auth/interfaces/authUtils';
import { PaginateResult } from "mongoose";
import { ICustomer } from '../../customer/interfaces/customer.interface';
import { CustomerService } from '../../customer/services/customer.service';
import { IOrganisation } from '../../organisation/interfaces/organisation.interface';
import { OrganisationService } from '../../organisation/services/organisation.service';
import { ProjectService } from '../../organisation/services/project.service';
import * as fromDto from '../../customer/dto';
import { IProject } from '../../organisation/interfaces/project.interface';
import { IUserRequest } from '../interfaces/user-request.interface';




@ApiTags('Administrator')
@Controller('admin')
export class AdminController {


    constructor(private readonly adminService: AdminService,
                private readonly organisationService: OrganisationService,
                private readonly projectService: ProjectService,
                private readonly customerService: CustomerService) {
    }



    private getDataListByIds = async (ids: string[], type: 'customer' | 'organisation' | 'project'): Promise<IOrganisation[] | IProject[] | ICustomer[]> => {

        switch (type) {

            case 'customer': {
                return await this.customerService.getMultipleCustomersByIds(ids);
            }
            case 'organisation': {
                return await this.organisationService.getMultipleOrganisationsByIds(ids);
            }
            case 'project': {
                return  this.projectService.getMultipleProjectsByIds(ids);
            }
            default: {
                throw new HttpException(text.INVALID_PARAMETER, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }



    // add a new admin
    @ApiBody({required: true, type: fromAdminDto.CreateAdminDto})
    @ApiOperation({summary: swaggerDoc.CreateAdmin.summary})
    @ApiResponse({ status: 200 })
    @Post('create')
    public async addNewAdministrator(@Body() adminDto: fromAdminDto.CreateAdminDto, @Res() response: Response): Promise<any> {

        const hashedPassword = await bCrypt.hash(adminDto.password, 10);

        try {

            const isUserExist: boolean = !!( await this.adminService.getAdminExist(adminDto) );

            if ( isUserExist ) {

                return response.status(HttpStatus.NOT_ACCEPTABLE)
                    .jsonp(
                        { status: false, message: text.ADMIN_ALREADY_EXIST, response: null}
                    )
            }

            const adminObject: IAdmin = ( await this.adminService.addAdmin( { ...adminDto, password: hashedPassword } ) );


            return response.status(HttpStatus.CREATED)
                .jsonp(
                    { status: true, message: text.ADMIN_CREATED_SUCCESS, response: _.omit(adminObject, 'password')}
                )

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ADMIN_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    // get admin detail
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({summary: swaggerDoc.AdminProfile.summary })
    @ApiResponse({ status: 200 })
    @Get('profile')
    public async adminProfile(@Req() request: Request | any, @Res() response: Response): Promise<any> {

        try {

            const userObject: IAdmin = await this.adminService.getAdminById(request.user.sub);

            if (!userObject) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.ADMIN_PROFILE_NOT_FOUND});
            }

            return response.status(HttpStatus.OK).jsonp({status: true, message: text.GET_ADMIN_PROFILE_SUCCESS, admin: userObject});

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.GET_ADMIN_PROFILE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }

    // update admin detail
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({summary: swaggerDoc.UpdateProfile.summary})
    @ApiResponse({ status: 200 })
    @ApiParam({name: 'id', required: true})
    @Put('updateProfile/:id')
    public async updateProfile(@Res() response: Response, @Param() requestParameter: {id: string}, @Body() updateAdminDto: fromAdminDto.UpdateAdminDto): Promise<any> {

        try {

            const userObject: IAdmin = await this.adminService.updateAdminById(requestParameter.id, updateAdminDto);

            if (!userObject) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.ADMIN_UPDATED_FAILED});
            }

            return response.status(HttpStatus.OK).jsonp({status: true, message: text.ADMIN_UPDATED_FAILED, response: _.omit(userObject, 'password')});

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ADMIN_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }

    

    // get data list by pagination
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN)
    @ApiQuery({ name: 'query', type: Object })
    @ApiParam({ name: 'for', type: String, enum: ['customer', 'organisation', 'donation', 'project'] })
    @ApiOperation({ summary: swaggerDoc.DataListing.summary })
    @ApiResponse({ status: 200 })
    @Get('list/:for')
    public async getDataSets(@Query() requestQuery: any, @Res() response: Response, @Param() reqParam: {for: 'customer' | 'organisation' | 'donation' | 'project'} ): Promise<any> {

        let listDataSet: PaginateResult<ICustomer> | PaginateResult<IOrganisation> | PaginateResult<IProject>;

        try {

            switch (reqParam.for) {

                case 'customer': {
                    listDataSet = await this.customerService.getAllCustomer(requestQuery.query, requestQuery); break;
                }

                case 'organisation': {
                    listDataSet = await this.organisationService.getAllOrganisation(requestQuery.query, requestQuery); break;
                }

                case 'project': {
                    listDataSet = await this.projectService.getAllProjects(requestQuery.query, requestQuery); break;
                }

                default: {
                    return new HttpException(text.DATA_LIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }

            return response.status(HttpStatus.OK).jsonp({ status: true, message: text.DATA_LIST_SUCCESS, response: listDataSet });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.DATA_LIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // update user
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: swaggerDoc.UpdateMultiple.summary })
    @ApiResponse({ status: 200 })
    @ApiParam({ name: 'for', type: String, enum: ['customer', 'organisation', 'project'] })
    @ApiBody({ type: fromDto.UpdateMultipleSets, required: true })
    @Patch('updateMultiSets/:for')
    public async updateManyCustomer(@Res() response: Response, @Body() reqBody: fromDto.UpdateMultipleSets, @Param() reqParam: {for: 'customer' | 'organisation' | 'project'}): Promise<any> {

        try {

            let isUpdated: any;

            switch (reqParam.for) {

                case 'customer': {
                    isUpdated = await this.customerService.updateManyCustomers(reqBody.ids, reqBody.fieldObject); break;
                }

                case 'organisation': {
                    isUpdated = await this.organisationService.updateManyOrganisations(reqBody.ids, reqBody.fieldObject); break;
                }

                case 'project': {
                    isUpdated = await this.projectService.updateManyProjects(reqBody.ids, reqBody.fieldObject); break;
                }

                default: {
                    return new HttpException(text.DATA_LIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }


            if ( ! isUpdated ) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.CONTENT_UPDATED_FAILED, response: null});
            }

            const listOfUpdatedInfo: ICustomer[] | IOrganisation[] | IProject[] = await this.getDataListByIds(reqBody.ids, reqParam.for);
            return response.status(HttpStatus.OK).jsonp({status: true, message: text.CONTENT_UPDATED_SUCCESS, response: listOfUpdatedInfo});

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.CONTENT_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // update user
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: swaggerDoc.DeleteMultiple.summary })
    @ApiResponse({ status: 200 })
    @ApiParam({name: 'id', required: true})
    @ApiParam({ name: 'for', type: String, enum: ['customer', 'organisation', 'project'] })
    @Delete(':for/delete/:id')
    public async deleteMultipleCustomer(@Res() response: Response, @Param() reqParam: {id: string, for: 'customer' | 'organisation' | 'project'}): Promise<any> {

        try {

            const arrayOfIds: string[] = Buffer.from( reqParam.id, 'base64' ).toString().split(',');
            let isDeleted: any;

            switch (reqParam.for) {

                case 'customer': {
                    isDeleted = await this.customerService.deleteMultipleCustomers(arrayOfIds); break;
                }

                case 'organisation': {
                    isDeleted = await this.organisationService.deleteMultipleOrganisations(arrayOfIds); break;
                }

                case 'project': {
                    isDeleted = await this.projectService.deleteMultipleProjects(arrayOfIds); break;
                }

                default: {
                    return new HttpException(text.DATA_LIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }

            if ( ! isDeleted ) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.CONTENT_DELETED_FAILED, response: null});
            }
            return response.status(HttpStatus.OK).jsonp({status: true, message: text.CONTENT_DELETED_SUCCESS, response: isDeleted });

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.CONTENT_DELETED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // update admin detail
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({summary: swaggerDoc.UpdateProfile.summary})
    @ApiResponse({ status: 200 })
    @ApiBody({required: true, type: fromAdminDto.UpdateContentDto})
    @Put('content')
    public async manageAppContent(@Res() response: Response, @Body() updateAdminDto: fromAdminDto.UpdateContentDto): Promise<any> {

        try {


            const applicationContent: IContent = await this.adminService.manageContent(updateAdminDto.contentValue);

            if (!applicationContent) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.CONTENT_UPDATED_FAILED});
            }

            return response.status(HttpStatus.OK).jsonp({status: true, message: text.CONTENT_UPDATED_SUCCESS, response: applicationContent});

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.CONTENT_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }




    // update admin detail
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({summary: swaggerDoc.AddNewFaq.summary})
    @ApiResponse({ status: 200 })
    @ApiBody({required: true, type: fromAdminDto.FaqDto, isArray: true})
    @ApiParam({name: 'for', required: true, enum: ['organisation', 'customer']})
    @Post('faq/add/:for')
    public async addFaq(@Res() response: Response, @Body() faqBody: fromAdminDto.FaqDto[], @Param() reqParam: {for: string}): Promise<any> {

        try {

            const payloadArray = faqBody.map( value => ({ ...value, questionFor: reqParam.for.toUpperCase() }) );
            const faqResponse: IFaq = await this.adminService.addFaq( payloadArray );

            if ( ! faqResponse ) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({success: true, message: text.FAQ_ADDED_FAIL, response: null});
            }

            return response.status(HttpStatus.OK).jsonp({success: true, message: text.FAQ_ADDED_SUCCESS, response: faqResponse})

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.CONTENT_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }




    // update admin detail
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({summary: swaggerDoc.EditNewFaq.summary})
    @ApiResponse({ status: 200 })
    @ApiBody({required: true, type: fromAdminDto.FaqDto})
    @ApiParam({name: 'id', required: true})
    @Put('faq/edit/:id')
    public async editFaq(@Res() response: Response, @Body() faqBody: fromAdminDto.FaqDto, @Param() reqParam: {id: string}): Promise<any> {

        try {

            const faqResponse: IFaq = await this.adminService.editFaq( reqParam.id, faqBody );

            if ( ! faqResponse ) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({success: true, message: text.FAQ_UPDATE_FAIL, response: null});
            }

            return response.status(HttpStatus.OK).jsonp({success: true, message: text.FAQ_UPDATE_SUCCESS, response: faqResponse})


        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.FAQ_UPDATE_FAIL, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }




    // update admin detail
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({summary: swaggerDoc.UserRequest.summary})
    @ApiResponse({ status: 200 })
    @ApiQuery({ name: 'query', type: Object })
    @ApiParam({name: 'for', enum: ['organisation', 'customer', 'outsider'], required: true})
    @Get('userRequests/:for')
    public async getUserRequests(@Res() response: Response, @Param() reqParam: {for: 'organisation' | 'customer' | 'outsider'}, @Query() reqQuery: any): Promise<any> {

        try {

            const condition = reqParam.for === 'outsider' ? ({organisation: null, customer: null}) : ({[reqParam.for]: { $ne: null}})
            const userRequestResult: PaginateResult<IUserRequest> = await this.adminService.getUserRequests( condition, reqQuery );

            if ( ! userRequestResult ) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({success: true, message: text.USER_REQ_RETRIEVE_FAIL, response: null});
            }

            return response.status(HttpStatus.OK).jsonp({success: true, message: text.USER_REQ_RETRIEVE_SUCCESS, response: userRequestResult})


        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.USER_REQ_RETRIEVE_FAIL, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }





    private handleErrorLogs = (error: any): void => console.log(error)
}
