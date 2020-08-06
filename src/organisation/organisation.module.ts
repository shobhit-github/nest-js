import { Module } from '@nestjs/common';
import { OrganisationService } from "./services/organisation.service";
import { OrganisationController } from "./controllers/organisation.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { OrganisationSchema, Organisation } from 'src/_sharedCollections/dbSchemas/organisation.schema';
import { NestMailerService } from "../_sharedCollections/mailer/nest-mailer.service";
import { OrganisationSocket } from './webSockets/organisation-socket';

@Module({
    providers: [
        OrganisationService,
        NestMailerService,
        OrganisationSocket
    ],
    controllers: [OrganisationController],
    imports: [
        MongooseModule.forFeature([
            { schema: OrganisationSchema, name: Organisation.name, collection: 'Organisations'}
        ])
    ],
    exports: [ OrganisationService, OrganisationSocket ]
})
export class OrganisationModule {}
