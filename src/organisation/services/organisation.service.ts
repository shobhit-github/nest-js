import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IOrganisation } from "../interfaces/organisation.interface";
import { NestMailerService } from "../../_sharedCollections/mailer/nest-mailer.service";
import * as fromDto from "../dto";
import { Organisation } from "../../_sharedCollections/dbSchemas/organisation.schema";

@Injectable()
export class OrganisationService {


    constructor(@InjectModel(Organisation.name) private readonly organisationModel: Model<IOrganisation>,
                private nestMailerService: NestMailerService) {
    }


    // update verification code for organisation
    public updateVerificationCode = async (organisationId: string, code: number): Promise<IOrganisation> =>
        await this.organisationModel.findByIdAndUpdate(organisationId, <fromDto.UpdateVerificationCodeDto>{ verificationCode: code });


    // fetch all organisations
    public getAllOrganisation = async (): Promise<IOrganisation[]> => await this.organisationModel
        .find(null, { password: 0 }).exec();


    // Get a single organisation
    public getOrganisationById = async (organisationID): Promise<IOrganisation> => await this.organisationModel
        .findById(organisationID, { password: 0 }).exec();


    // Get a single organisation by object field
    public getSingleOrganisation = async (object: any): Promise<IOrganisation | any> => await this.organisationModel.findOne(object).exec();


    // Get a count of organisation by object field
    public getOrganisationCount = async (object: any): Promise<number> => await this.organisationModel.count(object).exec();


    // post a single organisation
    public addOrganisation = async (createOrganisationDTO: fromDto.CreateOrganisationDto): Promise<IOrganisation> =>
        (await new this.organisationModel(createOrganisationDTO)).save();


    // Edit organisation details
    public updateOrganisationById = async (organisationID: string, updateOrganisation: any): Promise<IOrganisation> =>
        await this.organisationModel
            .findByIdAndUpdate(organisationID, updateOrganisation, { new: true });


    // Edit organisation details
    public updateOrganisation = async (condition: any, updateOrganisation: any): Promise<IOrganisation> =>
        await this.organisationModel
            .findOneAndUpdate(condition, updateOrganisation, { new: true });


    // Delete a organisation
    public deleteOrganisation = async (organisationID: string): Promise<any> => await this.organisationModel.findByIdAndRemove(organisationID);


    // send verification code to organisation email
    public sendEmailVerification = async (organisation: IOrganisation, verificationCode: number): Promise<any> => {

        return await this.nestMailerService.sendEmailVerificationCode(
            {to: organisation.email, context: {organisationName: organisation.organisationName, verificationCode } }
        )
    };


    // re-send verification code to organisation email
    public resendVerificationCode = async (organisation: IOrganisation, verificationCode: number): Promise<any> => (
        await this.nestMailerService.reSendCode({to: organisation.email, context: {verificationCode } })
    );


    // get Organisation for recommendation list
    public getOrganisationByInterests = async (ids: string[]): Promise<any> => (
        await this.organisationModel.find({interests: { $in: ids} }, {password: 0}).exec()
    );
}
