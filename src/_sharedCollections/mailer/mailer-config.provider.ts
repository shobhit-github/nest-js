import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailerOptions, MailerOptionsFactory } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';


@Injectable()
export class MailerConfigProvider implements MailerOptionsFactory {


    private readonly TEMPLATE_PATH: string = __dirname + '/_emailTemplates';
    private readonly handleBarInstance: HandlebarsAdapter = new HandlebarsAdapter();


    constructor(private readonly configService: ConfigService) {

    }

    public createMailerOptions(): Promise<MailerOptions> | MailerOptions {

        return {
            transport: `smtps://${this.smtpUser}:${this.smtpPass}@${this.smtpHost}`,
            template: {
                adapter: this.handleBarInstance, dir: this.TEMPLATE_PATH, options: { strict: true }
            }
        }
    }


    private get smtpUser(): string {
        return this.configService.get<string>('smtpSetting.userName');
    };

    private get smtpHost(): string {
        return this.configService.get<string>('smtpSetting.hostName');
    };

    private get smtpPass(): string {
        return this.configService.get<string>('smtpSetting.password');
    };


}
