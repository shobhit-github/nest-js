import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpService,
    HttpStatus,
    Param,
    Post,
    Put,
    Res,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import * as _ from 'lodash';

import * as fromDto from '../dto';

import * as text from '../constants/en';
import * as swaggerVal from '../constants/swagger';

import { CustomerSocket } from '../webSockets/customer-socket';
import { OrganisationService } from '../../organisation/services/organisation.service';
import { CustomerService } from '../services/customer.service';
import { PaymentService } from '../services/payment.service';
import { PermissionGuard, Permissions, JwtAuthGuard } from 'src/auth/guard/permission.guard';



@ApiTags('Customer')
@Controller('payment')
export class PaymentController {


    constructor(private readonly customerService: CustomerService,
                private readonly organisationService: OrganisationService,
                private readonly paymentService: PaymentService,
                private readonly customerSocket: CustomerSocket) {
    }



    private executeOneTimePayment = async (payloadObject: fromDto.OneTimeCardPaymentDto): Promise<any> => {

        const reference: string = 'CST_' + payloadObject.customer_id + '_to_' + 'ORG_' + payloadObject.organisation_id;
        const additionalData: any = { 'card.encrypted.json': "adyenjs_0_1_18$axHB86d5OXcN0uwo7irHwVKdvW7KFCKuq1pXWfY5E1hNu0FX+kEM/m3MLO5v3UzvfXNR4tfmx/rqlF6GJJH33EcYkZnvqFqHquvnOCy2hpBK63chHZi96P3Y/9QP6yLGCtf9CE/qeRv7bU5kMb0CrzVbUIGKguXs6uzW0EugVARz9fvQUZKWZRpFH2nmFa+sQsn6qmmiSBNb4dABBMDJOBJMzUy50Y7oNGocVBJGJ6xP6fcVfkT8JIttdx2c49M85NCQT7Egryl57EGLydHAlkHC8dNI/TX7l6aw84eJ3ymzPeB3D9XJehD0wglM9SEwQ+d0NDuCcuH6exlxvtQSQA==$Mwov0eyiDMa32/SyzA4hHrV7E+8sF9HGgAZWGPz+CI31IfrM86JwYCIw+IxCVhkXjqwKDSBdJmboXCojDHxYqZMp9d4ruBK3y/BlYehbsSfbuO+L/SrF5X1AMR9gW47lD8hhsJGUmtLEF7zhDOgI9tF6Pdw2F/Y5x3RYJh28iWjbqyIsffF0h/4qII3J8UbEg+nFDmBFXJ05uAc5TpxC775tlpJJCHWKBC+4BZccoNiLcl1Dc4+Ds1rbOpzgj4vJzcexqdz1UzWK590TiqOv8fzOrPhAHAKd35llhhuT8TgeeznHd2XjljUg9hZ137/L1qlvtbAVnY/s" };
        const paymentSuccessObject = await this.paymentService.makeCardPayment( { additionalData, reference, amount: payloadObject.paymentDetails.amount } );

        console.log(paymentSuccessObject)
    }



    // upload organisation logo
    @ApiExcludeEndpoint(true)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions('customer')
    @ApiParam({ required: true, name: 'code' })
    @ApiOperation({ summary: swaggerVal.PaymentMethods.summary })
    @ApiResponse({ status: 200 })
    @Post('methods/:code')
    public async findPaymentMethods(@Res() response: Response, @Param() requestParameter: { code: string }): Promise<any> {


        try {

            const paymentMethodResponse = await this.paymentService.getPaymentMethods( {countryCode: requestParameter.code, channel: 'Web'} )

            return response.status(HttpStatus.OK)
                .jsonp({status: true, message: text.PAYMENT_METHOD_RETRIEVED, paymentMethodResponse})


        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.PAYMENT_METHOD_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // upload organisation logo
    @ApiExcludeEndpoint(true)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions('customer')
    @ApiParam({ required: true, name: 'type', enum: ['one-time', 'recurring'] })
    @ApiOperation({ summary: swaggerVal.OrganisationPayment.summary })
    @ApiResponse({ status: 200 })
    @ApiBody({type: fromDto.OneTimeCardPaymentDto, required: true})
    @Post('organisation/:type')
    public async organisationPayment(@Body() requestBody: fromDto.OneTimeCardPaymentDto, @Res() response: Response, @Param() requestParameter: { type: 'one-time' | 'recurring' }): Promise<any> {

        try {

            // const organisationProfile: IOrganisation = await this.organisationService.getOrganisationById(requestBody.organisation_id);
            // const customerProfile: ICustomer = await this.customerService.getCustomerById(requestBody.customer_id);

            switch (requestParameter.type) {

                case 'one-time': {
                    await this.executeOneTimePayment(requestBody);
                }

                case 'recurring': {

                }
            }


        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }









    private handleErrorLogs = (error: any): void => console.log(error)
}
