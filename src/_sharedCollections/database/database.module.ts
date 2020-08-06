import { Module } from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {MongooseConfigService} from "./mongooose.provider";


@Module({
    imports: [
        MongooseModule.forRootAsync(
        { useClass: MongooseConfigService }
        ),
    ]
})
export class DatabaseModule {
}
