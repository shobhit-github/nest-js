import { Module } from '@nestjs/common';
import { UtilityController } from './controllers/utility.controller';
import { UtilityService } from './services/utility.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Categories, CategorySchema } from '../_sharedCollections/dbSchemas/categories.schema';

@Module({
    controllers: [UtilityController],
    imports: [
        MongooseModule.forFeature([
            { schema: CategorySchema, name: Categories.name, collection: 'Categories'}
        ])
    ],
    providers: [UtilityService]
})
export class UtilityModule {}
