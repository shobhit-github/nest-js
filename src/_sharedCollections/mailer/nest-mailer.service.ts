import { Injectable } from '@nestjs/common';
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NestMailerService {


    constructor(private readonly mailerService: MailerService,
                private readonly configService: ConfigService) {
    }


    public sendEmailVerificationCode = (mailOptions): Promise<any> => {

        const subject: string = 'Welcome to Givmo - Donation';
        const from: string = 'Givmo <' + this.configService.get<string>('emailAddress.verification') + '>';
        const template: string = 'emailVerification';

        try {

            return this.mailerService.sendMail( { ...mailOptions, from, subject, template } );

        } catch (e) {

            return Promise.reject(e)
        }

    };


    public sendUserRequestReply = (mailOptions): Promise<any> => {

        const subject: string = 'Givmo Support';
        const from: string = 'Givmo <' + this.configService.get<string>('emailAddress.support') + '>';
        const template: string = 'support';

        try {

            return this.mailerService.sendMail( { ...mailOptions, from, subject, template } );

        } catch (e) {

            return Promise.reject(e)
        }

    };


    public reSendCode = (mailOptions): Promise<any> => {

        const subject: string = 'Verification Code - Donation';
        const from: string = 'Givmo <' + this.configService.get<string>('emailAddress.verification') + '>';
        const template: string = 'verificationCode';

        try {

            return this.mailerService.sendMail( { ...mailOptions, subject, template, from } );

        } catch (e) {

            return Promise.reject(e)
        }

    };


    public forgetPasswordRequest = (mailOptions): Promise<any> => {

        const subject: string = 'Forget Password - Donation';
        const from: string = 'Givmo <' + this.configService.get<string>('emailAddress.support') + '>';
        const template: string = 'forgetPassword';

        try {

            return this.mailerService.sendMail( { ...mailOptions, subject, template, from } );

        } catch (e) {

            return Promise.reject(e)
        }

    }


    public sendOrganisationCredentials = (mailOptions): Promise<any> => {

        const subject: string = 'Profile Approved';
        const from: string = 'Givmo <' + this.configService.get<string>('emailAddress.support') + '>';
        const template: string = 'organisationCredential';

        try {

            return this.mailerService.sendMail( { ...mailOptions, subject, template, from } );

        } catch (e) {

            return Promise.reject(e)
        }

    }
}
