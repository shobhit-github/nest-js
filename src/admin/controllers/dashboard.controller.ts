import {
    Controller, HttpException, HttpStatus, Res, Get, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {Response} from "express";
import {parallel} from 'async';


import * as text from '../constants/en';
import * as swaggerDoc from '../constants/swagger';



import { AdminAuthGuard } from 'src/auth/guard/admin.guard';

import { CustomerService } from '../../customer/services/customer.service';
import { OrganisationService } from '../../organisation/services/organisation.service';




@ApiTags('Administrator')
@Controller('admin')
export class DashboardController {


    constructor(private readonly organisationService: OrganisationService,
                private readonly customerService: CustomerService) {
    }


    private customerProfileData = async (callback, query) => {
        try {
            callback(null, (await this.customerService.getCustomerCount(query)) );
        } catch (e) {
            callback(e, null)
        }
    }


    private organisationProfileData = async (callback, query) => {
        try {
            callback(null, (await this.organisationService.getOrganisationCount(query)));
        } catch (e) {
            callback(e, null)
        }
    }


    // update admin detail
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: swaggerDoc.Dashboard.summary })
    @ApiResponse({ status: 200 })
    @Get('dashboard')
    public async adminDashboard(@Res() response: Response): Promise<any> {

        try {

            parallel( {
                organisationCount: (callback) => this.organisationProfileData(callback, {}),
                loginOrganisationCount: (callback) => this.organisationProfileData(callback, {'profileStatus.isLoggedIn': true}),
                suspendedOrganisationCount: (callback) => this.organisationProfileData(callback, {'profileStatus.isSuspended': true}),
                approvedProfileOrganisationCount: (callback) => this.organisationProfileData(callback, {'profileStatus.isProfileApproved': true}),
                verifiedOrganisationCount: (callback) => this.organisationProfileData(callback, {'profileStatus.isVerified': true}),
                customerCount: (callback) => this.customerProfileData(callback, {}),
                loginCustomerCount: (callback) => this.customerProfileData(callback, {'profileStatus.isLoggedIn': true}),
                suspendedCustomerCount: (callback) => this.customerProfileData(callback, {'profileStatus.isSuspended': true}),
                approvedProfileCustomerCount: (callback) => this.customerProfileData(callback, {'profileStatus.isProfileApproved': true}),
                verifiedCustomerCount: (callback) => this.customerProfileData(callback, {'profileStatus.isVerified': true}),
            }, function(error, result) {

                if (error) {
                    throw new HttpException(text.DASHBOARD_DATA_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
                }

                return response.status(HttpStatus.OK).jsonp({status: true, message: text.DASHBOARD_DATA_SUCCESS, result});
            } )



        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.DASHBOARD_DATA_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }


    private handleErrorLogs = (error: any): void => console.log(error)
}
