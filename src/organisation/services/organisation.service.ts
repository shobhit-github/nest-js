import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, PaginateModel, PaginateResult } from "mongoose";
import { IOrganisation } from "../interfaces/organisation.interface";
import { NestMailerService } from "../../_sharedCollections/mailer/nest-mailer.service";
import * as fromDto from "../dto";
import * as fromAdminDto from 'src/admin/dto';
import { Organisation } from "../../_sharedCollections/dbSchemas/organisation.schema";
import { PaymentService } from '../../customer/services/payment.service';
import { IUserRequest } from '../../utility/interfaces/user-request.interface';
import { Request as UserRequest } from '../../_sharedCollections/dbSchemas/request.schema';
import { Project } from '../../_sharedCollections/dbSchemas/project.schema';
import { IProject } from '../interfaces/project.interface';



@Injectable()
export class OrganisationService {

    constructor(@InjectModel(Organisation.name) private readonly organisationModel: PaginateModel<IOrganisation>,
                @InjectModel(Project.name) private readonly projectModel: PaginateModel<IProject> | Model<IProject> | any,
                @InjectModel(UserRequest.name) private readonly requestModel: Model<IUserRequest>,
                private readonly nestMailerService: NestMailerService,
                @Inject(forwardRef(() => PaymentService)) private paymentService: PaymentService) {
    }


    // update verification code for organisation
    public updateVerificationCode = async (organisationId: string, code: number): Promise<IOrganisation> =>
        await this.organisationModel.findByIdAndUpdate(organisationId, <fromDto.UpdateVerificationCodeDto>{ verificationCode: code }, {projection: {password: 0}});


    // fetch all organisations
    public getAllOrganisation = async (conditions: any, paging: fromAdminDto.DataListDto): Promise<PaginateResult<IOrganisation>> => (
        await this.organisationModel.paginate(conditions, { ...paging, select: { password: 0 } })
    );


    public getMultipleOrganisationsByIds = async (ids: string[]): Promise<IOrganisation[]> => (await this.organisationModel.find({ _id: { $in: ids } }));


    // Get a single organisation
    public getOrganisationById = async (organisationID): Promise<IOrganisation> => await this.organisationModel
        .findById(organisationID, { password: 0 }).populate({path: 'interests'});


    // Get a single organisation by object field
    public getSingleOrganisation = async (object: any): Promise<IOrganisation | any> => await this.organisationModel.findOne(object, {password: 0}).exec();


    // Get a single organisation by object field
    public getSingleOrganisationForAuth = async (object: any): Promise<IOrganisation | any> => await this.organisationModel.findOne(object).exec();


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
        await this.organisationModel.findOneAndUpdate(condition, updateOrganisation, { new: true });


    // update multiple records
    public updateManyOrganisations = async (listOfIds: string[], payload): Promise<IOrganisation[]> => {
        return this.organisationModel.updateMany({ _id: { $in: listOfIds } }, { $set: { ...payload } });
    };


    // delete multiple records
    public deleteMultipleOrganisations = async (listOfIds: string[]): Promise<any> => {
        return this.organisationModel.deleteMany({ _id: { $in: listOfIds } });
    };


    // send organisation credentials
    public async sendCredentials(userInfo: IOrganisation, generatedPassword: string) {

        return this.nestMailerService.sendOrganisationCredentials({ to: userInfo.email, context: {generatedPassword, organisationName: userInfo.organisationName} })
    }


    // get Organisation for recommendation list
    public getOrganisationByInterests = async (ids: string[], paging: any): Promise<PaginateResult<IOrganisation>> => (
        await this.organisationModel.paginate({interests: { $in: ids} }, {...paging})
    );


    // get Organisation for recommendation list
    public searchOrganisation = async (condition: any[], paging: any): Promise<PaginateResult<IOrganisation>> => (
        await this.organisationModel.paginate({ $or: condition }, {...paging})
    );


    public createAccountHolder = async (payload: any): Promise<any> => this.paymentService.createAccountHolder(payload);


    // add new user request
    public submitUserRequest = async (payload: fromDto.OrganisationUserRequestDto): Promise<IUserRequest> => ( await new this.requestModel( payload ) ).save();

}
