import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { AdminService } from "./services/admin.service";
import { AdminController } from "./controllers/admin.controller";
import { Admin, AdminSchema } from "../_sharedCollections/dbSchemas/admin.schema";
import { CustomerModule } from '../customer/customer.module';
import { AdminSocket } from './webSockets/admin-socket';

@Module({

    providers: [AdminService, AdminSocket],
    controllers: [AdminController],
    imports: [
        MongooseModule.forFeature([
            { schema: AdminSchema, name: Admin.name, collection: 'AdminUsers'}
        ]),
        CustomerModule
    ],
    exports: [AdminService, AdminSocket]
})
export class AdminModule {}
