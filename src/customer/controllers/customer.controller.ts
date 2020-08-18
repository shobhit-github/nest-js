import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {Response} from "express";

import * as bCrypt from 'bcrypt'
import * as _ from 'lodash';

import * as fromDto from "../dto";
import { CustomerService } from "../services/customer.service";

import * as text from '../constants/en';
import * as utils from '../../_sharedCollections/helpers/utils';

import { ICustomer } from "../interfaces/customer.interface";
import { CustomerSocket } from '../webSockets/customer-socket';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { PaginateResult } from "mongoose";




@ApiTags('Customer')
@Controller('customer')
export class CustomerController {


    constructor(private readonly customerService: CustomerService,
                private readonly customerSocket: CustomerSocket) {
    }



    private sendEmailVerificationWithCode = (customerObject: ICustomer, code: number) : Promise<any> => {

        return this.customerService.sendEmailVerification(customerObject, code)
    };


    // add a customer
    @ApiBody({required: true, type: fromDto.CreateCustomerDto})
    @ApiOperation({summary: 'Create a new customer for new donations'})
    @ApiResponse({ status: 200 })
    @Post('create')
    public async addNewCustomer(@Body() customerDto: fromDto.CreateCustomerDto, @Res() response: Response): Promise<any> {

        console.log(customerDto);

        const hashedPassword = await bCrypt.hash(customerDto.password, 10);
        const verificationCode: number = utils.generateRandomNumber(1000, 9999);

        try {

            const isUserExist: boolean = !!( await this.customerService.getSingleCustomer({email: customerDto.email}) );

            if ( isUserExist ) {

                return response.status(HttpStatus.NOT_ACCEPTABLE)
                    .jsonp(
                        { status: false, message: text.CUSTOMER_ALREADY_EXIST, response: null}
                    )
            }

            const customerObject: ICustomer = ( await this.customerService.addCustomer( { ...customerDto, password: hashedPassword } ) );
            const emailResponse = this.sendEmailVerificationWithCode(customerObject, verificationCode);
            const updatedCodeResponse = this.customerService.updateVerificationCode(customerObject._id, verificationCode);

            const finalResponse = ( await Promise.all([emailResponse, updatedCodeResponse]) );
            this.customerSocket.newAccountCreated(_.omit(customerObject, 'password'));

            console.log(finalResponse)

            return response.status(HttpStatus.OK)
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

            const updatedCodeResponse = this.customerService.updateCustomerById(
                customerObject._id,
                <fromDto.UpdateProfileStatusAndVerificationDto>{
                    profileStatus: { ...customerObject.profileStatus, isVerified: true  }, verificationCode: null
                }
            );

            console.log(updatedCodeResponse)

            return response.status(HttpStatus.OK)
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

        const verificationCode: number = utils.generateRandomNumber(1000, 9999);

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



    // send verification code
    @ApiOperation({summary: 'Resend verification code if the code have not received yet'})
    @ApiResponse({ status: 200 })
    @Get('trySocket')
    public async sampleSocket(@Res() response: Response): Promise<any> {



        try {


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

            console.log(requestQuery);
            const listCustomer: PaginateResult<ICustomer> = await this.customerService.getAllCustomer(requestQuery.query, requestQuery);

            console.log(listCustomer);
            response.status(HttpStatus.OK)
                .jsonp({status: true, message: text.LIST_CUSTOMER_SUCCESS, response: listCustomer})

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }







    private handleErrorLogs = (error: any): void => console.log(error)
}
