import {
    Body, Controller, HttpException, HttpStatus, Post, Res, Get, UseGuards, Req, Put, Param
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {Response, Request} from "express";

import * as bCrypt from 'bcrypt'
import * as _ from 'lodash';
import * as fromAdminDto from '../dto';
import * as text from '../constants/en';


import { AdminService } from "../services/admin.service";
import { IAdmin } from "../interfaces/admin.interface";
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

import {parallel} from 'async';




@ApiTags('Administrator')
@Controller('admin')
export class AdminController {


    constructor(private readonly adminService: AdminService) {
    }


    // add a new admin
    @ApiBody({required: true, type: fromAdminDto.CreateAdminDto})
    @ApiOperation({summary: 'This api for add new admin account'})
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
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: 'This api help to retrieve the admin profile by admin id'})
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
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: 'This api help to update the existing admin profile by admin id and payload'})
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




    private handleErrorLogs = (error: any): void => console.log(error)
}
