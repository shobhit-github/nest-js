import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { CustomerSchema, Customer } from "../_sharedCollections/dbSchemas/customer.schema";
import { CustomerController } from "./controllers/customer.controller";
import { CustomerService } from "./services/customer.service";
import { NestMailerService } from "../_sharedCollections/mailer/nest-mailer.service";
import { CustomerSocket } from './webSockets/customer-socket';
import { MulterModule } from '@nestjs/platform-express';
import { OrganisationModule } from '../organisation/organisation.module';
import { PaymentController } from './controllers/payment.controller';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './services/payment.service';
import { Donation, DonationSchema } from '../_sharedCollections/dbSchemas/donation.schema';
import { Request as UserRequest, RequestSchema } from '../_sharedCollections/dbSchemas/request.schema';

@Module({
    controllers: [CustomerController, PaymentController],
    providers: [CustomerService, NestMailerService, CustomerSocket, PaymentService],
    imports: [
        MongooseModule.forFeature([
            { schema: CustomerSchema, name: Customer.name, collection: 'Customers'},
            { schema: RequestSchema, name: UserRequest.name, collection: 'UserRequests'},
            { schema: DonationSchema, name: Donation.name, collection: 'Donations'}
        ]),
        MulterModule.register(),
        ConfigModule,
        HttpModule,
        forwardRef( () => OrganisationModule )
    ],
    exports: [CustomerService, CustomerSocket, PaymentService]
})
export class CustomerModule {}
