import { Module } from '@nestjs/common';
import { UtilityController } from './controllers/utility.controller';
import { UtilityService } from './services/utility.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Categories, CategorySchema } from '../_sharedCollections/dbSchemas/categories.schema';
import { Content, ContentSchema } from 'src/_sharedCollections/dbSchemas/content.schema';
import { Faq, FaqSchema } from 'src/_sharedCollections/dbSchemas/faq.schema';
import { Request as UserRequest, RequestSchema } from 'src/_sharedCollections/dbSchemas/request.schema';

@Module({
    controllers: [UtilityController],
    imports: [
        MongooseModule.forFeature([
            { schema: CategorySchema, name: Categories.name, collection: 'Categories'},
            { schema: ContentSchema, name: Content.name, collection: 'ContentManagement'},
            { schema: RequestSchema, name: UserRequest.name, collection: 'UserRequests'},
            { schema: FaqSchema, name: Faq.name, collection: 'QuestionAnswers'}
        ])
    ],
    providers: [UtilityService]
})
export class UtilityModule {}
