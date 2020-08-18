import AppConfigurations from "./settings.config";

import {  Module } from '@nestjs/common';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./_sharedCollections/database/database.module";
import { NestMailerModule } from "./_sharedCollections/mailer/nest-mailer.module";
import { AppSocket } from './app.socket';



@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({
            load: [ AppConfigurations ],
            isGlobal: true
        }),
        DatabaseModule,
        NestMailerModule
    ],
    controllers: [AppController],
    providers: [AppService, AppSocket]
})
export class AppModule {
}
