import {
    Body, Controller, HttpException, HttpStatus, Post, Res, Get, UseGuards, Req, Put, Param
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {Response, Request} from "express";

import * as bCrypt from 'bcrypt'
import * as _ from 'lodash';
import * as fromAdminDto from '../dto';
import * as text from '../constants/en';
import * as swaggerDoc from '../constants/swagger';


import { AdminService } from "../services/admin.service";
import { IAdmin } from "../interfaces/admin.interface";
import { AdminAuthGuard } from 'src/auth/guard/admin.guard';

import {parallel} from 'async';
import { IContent, IFaq } from '../interfaces/content.interface';




@ApiTags('Administrator')
@Controller('admin')
export class AdminController {


    constructor(private readonly adminService: AdminService) {
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
    @UseGuards(AdminAuthGuard)
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
    @UseGuards(AdminAuthGuard)
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




    // update admin detail
    @UseGuards(AdminAuthGuard)
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
    @UseGuards(AdminAuthGuard)
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
    @UseGuards(AdminAuthGuard)
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




    private handleErrorLogs = (error: any): void => console.log(error)
}
