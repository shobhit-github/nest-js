import { Module } from '@nestjs/common';
import { OrganisationService } from "./services/organisation.service";
import { OrganisationController } from "./controllers/organisation.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { OrganisationSchema, Organisation } from 'src/_sharedCollections/dbSchemas/organisation.schema';
import { NestMailerService } from "../_sharedCollections/mailer/nest-mailer.service";
import { OrganisationSocket } from './webSockets/organisation-socket';
import { MulterModule } from '@nestjs/platform-express';
import { Project, ProjectSchema } from '../_sharedCollections/dbSchemas/project.schema';
import { ProjectController } from './controllers/project.controller';
import { ProjectService } from './services/project.service';

@Module({
    providers: [
        OrganisationService,
        NestMailerService,
        OrganisationSocket,
        ProjectService
    ],
    controllers: [OrganisationController, ProjectController],
    imports: [
        MongooseModule.forFeature([
            { schema: OrganisationSchema, name: Organisation.name, collection: 'Organisations'},
            { schema: ProjectSchema, name: Project.name, collection: 'OrganisationProjects'}
        ]),
        MulterModule.register({dest: '../_uploads'})
    ],
    exports: [ OrganisationService, OrganisationSocket, ProjectService ]
})
export class OrganisationModule {}
