import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, PaginateModel, PaginateResult } from "mongoose";
import { IOrganisation } from "../interfaces/organisation.interface";
import { NestMailerService } from "../../_sharedCollections/mailer/nest-mailer.service";
import * as fromDto from "../dto";
import { Organisation } from "../../_sharedCollections/dbSchemas/organisation.schema";
import { PaymentService } from '../../customer/services/payment.service';
import { IUserRequest } from '../../utility/interfaces/user-request.interface';
import { Request as UserRequest } from '../../_sharedCollections/dbSchemas/request.schema';



@Injectable()
export class OrganisationService {

    constructor(@InjectModel(Organisation.name) private readonly organisationModel: PaginateModel<IOrganisation>,
                @InjectModel(UserRequest.name) private readonly requestModel: Model<IUserRequest>,
                private readonly nestMailerService: NestMailerService,
                @Inject(forwardRef(() => PaymentService)) private paymentService: PaymentService) {
    }


    // update verification code for organisation
    public updateVerificationCode = async (organisationId: string, code: number): Promise<IOrganisation> =>
        await this.organisationModel.findByIdAndUpdate(organisationId, <fromDto.UpdateVerificationCodeDto>{ verificationCode: code }, {projection: {password: 0}});


    // fetch all organisations
    public getAllOrganisation = async (): Promise<IOrganisation[]> => await this.organisationModel
        .find(null, { password: 0 }).exec();


    // fetch all organisations
    public getAllOrganisationIds = async (condition): Promise<IOrganisation[]> => await this.organisationModel
        .find(condition, { _id: 1 }).exec();


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
        await this.organisationModel.findByIdAndUpdate(organisationID, updateOrganisation, { new: true, projection: { password: 0} });


    // Edit organisation details
    public updateOrganisation = async (condition: any, updateOrganisation: any): Promise<IOrganisation> =>
        await this.organisationModel.findOneAndUpdate(condition, updateOrganisation, { new: true, projection: {password: 0} });


    // Delete a organisation
    public deleteOrganisation = async (organisationID: string): Promise<any> => await this.organisationModel.findByIdAndRemove(organisationID);


    // send organisation credentials
    public async sendCredentials(userInfo: IOrganisation, generatedPassword: string) {

        return this.nestMailerService.sendOrganisationCredentials({ to: userInfo.email, context: {generatedPassword, organisationName: userInfo.organisationName} })
    }


    // get Organisation for recommendation list
    public getOrganisationByInterests = async (ids: string[], paging: any): Promise<PaginateResult<IOrganisation>> => (
        await this.organisationModel.paginate({interests: { $in: ids} }, {...paging})
    );


    public createAccountHolder = async (payload: any): Promise<any> => this.paymentService.createAccountHolder(payload);


    // add new user request
    public submitUserRequest = async (payload: fromDto.OrganisationUserRequestDto): Promise<IUserRequest> => ( await new this.requestModel( payload ) ).save();

}
