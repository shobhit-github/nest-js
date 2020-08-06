import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfigProvider } from "./mailer-config.provider";
import { NestMailerService } from './nest-mailer.service';





@Module({

    imports: [
        MailerModule.forRootAsync(
            {
                useClass: MailerConfigProvider
            }
        )
    ],

    providers: [NestMailerService]
})
export class NestMailerModule {


}
