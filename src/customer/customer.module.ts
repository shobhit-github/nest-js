import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { CustomerSchema, Customer } from "../_sharedCollections/dbSchemas/customer.schema";
import { CustomerController } from "./controllers/customer.controller";
import { CustomerService } from "./services/customer.service";
import { NestMailerService } from "../_sharedCollections/mailer/nest-mailer.service";
import { CustomerSocket } from './webSockets/customer-socket';

@Module({
    controllers: [CustomerController],
    providers: [CustomerService, NestMailerService, CustomerSocket],
    imports: [
        MongooseModule.forFeature([
            { schema: CustomerSchema, name: Customer.name, collection: 'Customers'}
        ])
    ],
    exports: [CustomerService, CustomerSocket]
})
export class CustomerModule {}
