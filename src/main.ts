import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule } from "@nestjs/swagger";
import { SwaggerDocumentOptions } from "./settings.config";
import * as dotEnvironment from "dotenv-flow";
import * as express from 'express';
import {resolve} from "path";



(async function() {

    const mainApp = await NestFactory.create<NestExpressApplication>(AppModule, {cors: true});
    const document = SwaggerModule.createDocument(mainApp, SwaggerDocumentOptions);

    SwaggerModule.setup('api-doc', mainApp, document);
    mainApp.use('_uploads', express.static(process.cwd() + '/_uploads'));

    dotEnvironment.config();
    await mainApp.listen(6051);

})();


