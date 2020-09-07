import { forwardRef, Module } from '@nestjs/common';
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
import { CustomerModule } from '../customer/customer.module';
import { Request as UserRequest, RequestSchema } from '../_sharedCollections/dbSchemas/request.schema';



@Module({
    providers: [
        OrganisationService,
        ProjectService,
        NestMailerService,
        OrganisationSocket
    ],
    controllers: [OrganisationController, ProjectController],
    imports: [
        MongooseModule.forFeature([
            { schema: OrganisationSchema, name: Organisation.name, collection: 'Organisations'},
            { schema: ProjectSchema, name: Project.name, collection: 'OrganisationProjects'},
            { schema: RequestSchema, name: UserRequest.name, collection: 'UserRequests'},
        ]),
        MulterModule.register({dest: '../_uploads'}),
        forwardRef( () => CustomerModule )
    ],
    exports: [ OrganisationService, OrganisationSocket, ProjectService ]
})
export class OrganisationModule {}
