import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { AdminService } from "./services/admin.service";
import { AdminController } from "./controllers/admin.controller";
import { Admin, AdminSchema } from "../_sharedCollections/dbSchemas/admin.schema";
import { CustomerModule } from '../customer/customer.module';
import { AdminSocket } from './webSockets/admin-socket';
import { DashboardController } from './controllers/dashboard.controller';
import { OrganisationModule } from '../organisation/organisation.module';

@Module({

    providers: [AdminService, AdminSocket],
    controllers: [AdminController, DashboardController],
    imports: [
        MongooseModule.forFeature([
            { schema: AdminSchema, name: Admin.name, collection: 'AdminUsers'}
        ]),
        CustomerModule,
        OrganisationModule
    ],
    exports: [AdminService, AdminSocket]
})
export class AdminModule {}
