import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {Response} from "express";
import { AuthDto, ForgetPasswordDto, UpdatePasswordDto } from "../dto/auth.dto";
import { AuthenticationService } from "../services/authentication.service";


import * as text from '../constants/en';
import * as utils from '../../_sharedCollections/helpers/utils';
import * as _ from 'lodash';

// import * as _ from 'lodash';
import { IJwtToken } from "../interfaces/authUtils";
import { ICustomer, ICustomerWithPassword } from '../../customer/interfaces/customer.interface';
import { IAdmin, IAdminWithPassword } from '../../admin/interfaces/admin.interface';
import { AdminService } from "../../admin/services/admin.service";
import { OrganisationService } from "../../organisation/services/organisation.service";
import { CustomerService } from "../../customer/services/customer.service";
import { IOrganisation, IOrganisationWithPassword } from '../../organisation/interfaces/organisation.interface';
import { CustomerSocket } from '../../customer/webSockets/customer-socket';
import { OrganisationSocket } from '../../organisation/webSockets/organisation-socket';

import * as bCrypt from "bcrypt";





@ApiTags("Authentication")
@Controller("authentication")
export class AuthenticationController {



    constructor(private readonly authenticationService: AuthenticationService,
                private readonly customerService: CustomerService,
                private readonly customerSocket: CustomerSocket,
                private readonly adminService: AdminService,
                private readonly organisationService: OrganisationService,
                private readonly organisationSocket: OrganisationSocket) {
    }



    private checkUserProfileStatus = (userType: string, userObject: ICustomer): {message: string} => {

        if (userType === 'admin') {
            return {message: null};
        }
        return (!userObject.profileStatus.isProfileApproved) ? { message: text.PROFILE_IS_NOT_APPROVED } : (!userObject.profileStatus.isActive) ? { message: text.PROFILE_INACTIVE } : (!userObject.profileStatus.isVerified) ? { message: text.PROFILE_IS_NOT_VERIFIED } : (userObject.profileStatus.isSuspended) ? { message: text.PROFILE_SUSPENDED } : {message: null};
    };



    private updateForgetPasswordFlag = async (userType: string, email: string, password: string): Promise<IAdmin | ICustomer | IOrganisation> => {

        try {

            switch (userType) {

                case 'customer':
                    return ( await this.customerService.updateCustomer({email}, {password, isPasswordForgot: true}) );

                case 'admin':
                    return ( await this.adminService.updateAdmin({email}, {password, isPasswordForgot: true} ) );

                case 'organisation':
                    return ( await this.organisationService.updateOrganisation({email}, {password, isPasswordForgot: true}));

                default:
                    return Promise.resolve( null );
            }

        } catch (e) {

            return Promise.reject(e)
        }

    };



    private updatePasswordOfUser = async (userType: string, _id: string, password: string): Promise<IAdmin | ICustomer | IOrganisation> => {

        try {

            switch (userType) {

                case 'customer':
                    return ( await this.customerService.updateCustomer({_id}, {password}) );

                case 'admin':
                    return ( await this.adminService.updateAdmin({_id}, {password} ) );

                case 'organisation':
                    return ( await this.organisationService.updateOrganisation({_id}, {password}));

                default:
                    return Promise.resolve( null );
            }

        } catch (e) {

            return Promise.reject(e)
        }

    };



    private updateLoginStatus = async (userType: string, _id: string, status: boolean): Promise<ICustomer | IOrganisation> => {

        try {

            switch (userType) {

                case 'customer': {
                    const userObject: ICustomer = ( await this.customerService.updateCustomerById(_id, {'profileStatus.isLoggedIn': status}));
                    this.customerSocket.transmitLoginStatus(userObject, status); return userObject;
                }

                case 'organisation': {
                    const userObject: IOrganisation = ( await this.organisationService.updateOrganisationById(_id, {'profileStatus.isLoggedIn': status}));
                    this.organisationSocket.transmitLoginStatus(userObject, status); return userObject;
                }



                default:
                    return Promise.resolve( null );
            }

        } catch (e) {

            return Promise.reject(e)
        }

    };



    @ApiBody({ type: AuthDto, required: true })
    @ApiParam({ required: true, name: 'for', enum: ['customer', 'admin', 'organisation'] })
    @ApiOperation({summary: 'Authenticate user profile by choosing parameter (Admin, Customer & Organisation)'})
    @ApiResponse({ status: 200 })
    @Post('login/:for')
    public async authenticateUser(@Param() requestParameter: {for: "customer" | "admin" | "organisation"}, @Res() response: Response, @Body() requestBody: AuthDto) {

        let userObject: IAdmin | ICustomer | IOrganisation;

        try {

            switch (requestParameter.for) {

                case 'customer':
                    userObject = ( await this.authenticationService.validateCustomer(<string>requestBody.username, <string>requestBody.password) ); break;

                case 'admin':
                    userObject = ( await this.authenticationService.validateAdmin(<string>requestBody.username, <string>requestBody.password) ); break;

                case 'organisation':
                    userObject = ( await this.authenticationService.validateOrganisation(<string>requestBody.username, <string>requestBody.password) ); break;

                default:
                    return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.INVALID_PARAMETER, response: null})
            }


            if (!userObject) {
                return response.status(HttpStatus.UNAUTHORIZED).jsonp({status: false, message: text.AUTHENTICATION_INVALID})
            }

            const profileStatusMessage: string = this.checkUserProfileStatus(requestParameter.for, <any>userObject).message;

            if (profileStatusMessage) {
                return response.status(HttpStatus.UNAUTHORIZED).jsonp({status: false, message: <string>profileStatusMessage})
            }

            const jwtTokenObject: IJwtToken = this.authenticationService.loginUser(userObject);

            await this.updateLoginStatus(requestParameter.for, userObject._id, true);

            return response.status(HttpStatus.OK).jsonp({status: true, message: text.AUTHENTICATION_SUCCESS, jwtTokenObject})

        } catch (e) {

            this.handleErrorLogs(e);
            return response.status(HttpStatus.UNAUTHORIZED).jsonp({status: false, message: text.AUTHENTICATION_FAIL})
        }

    }




    @ApiBody({ type: ForgetPasswordDto, required: true })
    @ApiParam({ required: true, name: 'for', enum: ['customer', 'admin', 'organisation'] })
    @ApiOperation({summary: 'Forget password help to reset a new password by choosing parameter (Admin, Customer & Organisation)'})
    @ApiResponse({ status: 200 })
    @Post('forgetPassword/:for')
    public async forgetPassword(@Param() requestParameter: {for: "customer" | "admin" | "organisation"}, @Res() response: Response, @Body() requestBody: ForgetPasswordDto) {

        let isUserExist: boolean;
        const generatedPassword: string = utils.generateRandomString(7);
        const hashedPassword: string = await bCrypt.hash(generatedPassword, 10);

        try {

            switch (requestParameter.for) {

                case 'customer':
                    isUserExist = !!( await this.customerService.getCustomerCount({email: <string>requestBody.email}) ); break;

                case 'admin':
                    isUserExist = !!( await this.adminService.getAdminCount({ email: <string>requestBody.email}) ); break;

                case 'organisation':
                    isUserExist = !!( await this.organisationService.getOrganisationCount({email: <string>requestBody.email}) ); break;

                default:
                    return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.INVALID_PARAMETER, response: null})
            }


            if (!isUserExist) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.USER_NOT_FOUND})
            }

            await this.authenticationService.sendForgetPasswordRequest({email: <string>requestBody.email}, generatedPassword);

            const userObject: any = await this.updateForgetPasswordFlag(requestParameter.for, requestBody.email, hashedPassword);

            if (userObject) {
                return response.status(HttpStatus.OK).jsonp({status: true, message: text.FORGET_PASS_EMAIL_SENT_SUCCESS, response: _.omit(userObject, 'password')})
            }


        } catch (e) {

            this.handleErrorLogs(e);
            return response.status(HttpStatus.UNAUTHORIZED).jsonp({status: false, message: text.FORGET_PASS_EMAIL_SENT_FAIL})
        }

    }



    // update customer password
    @ApiBody({type: UpdatePasswordDto, required: true})
    @ApiParam({name: 'for', required: true})
    @ApiParam({name: 'id', required: true})
    @ApiOperation({summary: 'Change of (customer, admin, organisation) password with old password verification'})
    @ApiResponse({ status: 200 })
    @Put(':for/changePassword/:id')
    public async updatePassword(@Param() requestParameter: any, @Res() response: Response, @Body() requestBody: UpdatePasswordDto): Promise<any> {

        const hashedOfNewPassword = await bCrypt.hash(requestBody.newPassword, 10);
        let userObj: ICustomerWithPassword | IOrganisationWithPassword | IAdminWithPassword;

        try {


            switch (requestParameter.for) {

                case 'customer':
                    userObj = ( await this.customerService.getSingleCustomer({_id: <string>requestParameter.id}) ); break;

                case 'admin':
                    userObj = ( await this.adminService.getSingleAdmin({ _id: <string>requestParameter.id}) ); break;

                case 'organisation':
                    userObj = ( await this.organisationService.getSingleOrganisation({_id: <string>requestParameter.id}) ); break;

                default:
                    return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.INVALID_PARAMETER, response: null})
            }

            const isOldPasswordCorrect = (await this.authenticationService.isPasswordMatched(userObj.password, requestBody.oldPassword ) );

            if ( ! isOldPasswordCorrect ) {

                return response.status(HttpStatus.BAD_REQUEST)
                    .jsonp(
                        { status: false, message: text.INCORRECT_OLD_PASSWORD, response: null}
                    )
            }

            const updatedUserObject: any = await this.updatePasswordOfUser(requestParameter.for, requestParameter.id, hashedOfNewPassword);

            return response.status(HttpStatus.OK)
                .jsonp(
                    { status: true, message: text.PASSWORD_UPDATED_SUCCESS, response: _.omit(updatedUserObject, 'password')}
                )

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.PASSWORD_UPDATED_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }



    // update customer password
    @ApiParam({name: 'for', required: true})
    @ApiParam({name: 'id', required: true})
    @ApiOperation({summary: 'This api will change the login status for (customer, admin, organisation) to manage active login user'})
    @Put(':for/logout/:id')
    public async logout(@Param() requestParameter: {for: string, id: string}, @Res() response: Response): Promise<any> {

        try {

            const loginStatus: ICustomer | IOrganisation = await this.updateLoginStatus(requestParameter.for, requestParameter.id, false);

            return response.status(HttpStatus.OK)
                .jsonp(
                    { status: true, message: text.LOGOUT_SUCCESS, response: _.omit(loginStatus, 'password')}
                )

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.LOGOUT_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    @Get('logo/:fileId')
    async serveAvatar(@Param('fileId') fileId, @Res() response): Promise<any> {
        console.log(fileId, process.cwd())
        response.sendFile(fileId, { root: process.cwd() + '/_uploads/logo'});
    }


    private handleErrorLogs = (error: any): void => console.log(error)

}
