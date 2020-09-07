import { HttpService, Injectable } from '@nestjs/common';
import { PaginateModel, PaginateResult } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ICustomer } from '../interfaces/customer.interface';
import * as fromPaymentUrl from '../constants/payment-endpoints';
import { Customer } from "src/_sharedCollections/dbSchemas/customer.schema";
import { NestMailerService } from "../../_sharedCollections/mailer/nest-mailer.service";
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { IDonation } from '../interfaces/donation.interface';
import { Donation } from '../../_sharedCollections/dbSchemas/donation.schema';


@Injectable()
export class PaymentService {


    private readonly MERCHANT_ACCOUNT_ID: string = null;
    private readonly ENVIRONMENT: 'DEV' | 'PROD' | 'STAGE';

    private readonly defaultAuthHeader: {'X-API-key': string};


    constructor(@InjectModel(Customer.name) private readonly customerModel: PaginateModel<ICustomer>,
                @InjectModel(Donation.name) private readonly donationModel: PaginateModel<IDonation>,
                private readonly configService: ConfigService,
                private readonly nestMailerService: NestMailerService,
                private readonly httpService: HttpService) {

        this.MERCHANT_ACCOUNT_ID = this.configService.get<string>('paymentGateway.merchantAccountId');
        this.ENVIRONMENT = this.configService.get<'DEV' | 'PROD' | 'STAGE'>('environment');

        this.defaultAuthHeader = {'X-API-key': this.configService.get<string>('paymentGateway.apiKey')};
    }


    private refinePaymentEndPoints = (url: string): string => this.ENVIRONMENT === 'PROD' ? url.replace('test', 'live'): url;


    public getPaymentMethods = async (payload): Promise<any> => {

        const payloadMix = { ...payload, merchantAccount: this.MERCHANT_ACCOUNT_ID };
        const headers = this.defaultAuthHeader;

        return this.httpService.post( this.refinePaymentEndPoints(fromPaymentUrl.REQUEST_PAYMENT_METHODS), payloadMix, { headers } )
            .pipe( map( resPay => resPay.data ) ).toPromise()
    }


    public makeCardPayment = async (payload): Promise<any> => {

        const payloadMix = {...payload, merchantAccount: this.MERCHANT_ACCOUNT_ID};
        const headers = this.defaultAuthHeader;

        return this.httpService.post( this.refinePaymentEndPoints(fromPaymentUrl.AUTHORIZE_PAYMENT), payloadMix, { headers } )
            .pipe( map( resPay => resPay.data ) ).toPromise()
    }


    public authorizeForRecurringPayment = async (payload): Promise<any> => {

        const payloadMix = {...payload, merchantAccount: this.MERCHANT_ACCOUNT_ID};
        const headers = this.defaultAuthHeader;

        return this.httpService.post( this.refinePaymentEndPoints(fromPaymentUrl.AUTHORIZE_PAYMENT), payloadMix, { headers } )
            .pipe( map( resPay => resPay.data ) ).toPromise()
    }


    public createAccountHolder = async (payload): Promise<any> => {

        // const payloadMix = {...payload, merchantAccount: this.MERCHANT_ACCOUNT_ID};
        const headers = this.defaultAuthHeader;

        return this.httpService.post( this.refinePaymentEndPoints(fromPaymentUrl.CREATE_ACCOUNT_HOLDER), payload, { headers } )
            .pipe( map( resPay => resPay ) ).toPromise()
    }


}
