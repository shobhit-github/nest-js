


import { Injectable } from '@nestjs/common';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { InjectModel } from "@nestjs/mongoose";
import { IAdmin } from '../interfaces/admin.interface';
import { Admin } from '../../_sharedCollections/dbSchemas/admin.schema';

import * as fromAdminDto from "../dto";
import { Content } from 'src/_sharedCollections/dbSchemas/content.schema';
import { IContent, IFaq } from '../interfaces/content.interface';
import { Faq } from '../../_sharedCollections/dbSchemas/faq.schema';
import { IUserRequest } from '../interfaces/user-request.interface';
import { Request as UserRequest } from '../../_sharedCollections/dbSchemas/request.schema';
import { NestMailerService } from '../../_sharedCollections/mailer/nest-mailer.service';
import { ICustomer } from '../../customer/interfaces/customer.interface';
import { IProject } from '../../organisation/interfaces/project.interface';


@Injectable()
export class AdminService {


    constructor(@InjectModel(Admin.name) private readonly adminModel: Model<IAdmin>,
                @InjectModel(Content.name) private readonly contentModel: Model<IContent>,
                @InjectModel(UserRequest.name) private readonly userRequestModel: PaginateModel<IUserRequest>,
                private readonly nestMailerService: NestMailerService,
                @InjectModel(Faq.name) private readonly faqModel: Model<IFaq>) {
    }


    // fetch all admins
    public getAllAdmin = async(): Promise<IAdmin[]> => await this.adminModel
        .find(null, {password: 0}).exec();


    // Get a single admin
    public getAdminById = async (adminID): Promise<IAdmin> => await this.adminModel
        .findById(adminID, {password: 0}).exec();


    // Get a single admin by object field
    public getSingleAdmin = async (object: any): Promise<IAdmin | any> => await this.adminModel.findOne(object, {password: 0}).exec();


    // Get a single admin by object field
    public getSingleAdminForAuth = async (object: any): Promise<IAdmin | any> => await this.adminModel.findOne(object).exec();


    // Get a count of admin by object field
    public getAdminCount = async (object: any): Promise<number> => await this.adminModel.count(object).exec();


    // Get a count admin by custom fields
    public getAdminExist = async (object: fromAdminDto.CreateAdminDto): Promise<IAdmin | number> => await this.adminModel.count({
        $or:[ {email: object.email}, { username: object.username}, { phone: object.phone} ]
    }).exec();


    // post a single admin
    public addAdmin = async (createAdminDTO: fromAdminDto.CreateAdminDto): Promise<IAdmin> =>
        ( await new this.adminModel(createAdminDTO) ).save();



    // Edit admin details
    public updateAdminById = async(adminID: string, createAdminDTO: any): Promise<IAdmin> =>
        await this.adminModel
            .findByIdAndUpdate(adminID, createAdminDTO, { new: true, projection: {password: 0} });


    // Edit admin details
    public updateAdmin = async(condition: any, updateAdminDto: fromAdminDto.UpdateForgetPasswordFlag | any): Promise<IAdmin> =>
        await this.adminModel
            .findOneAndUpdate(condition, updateAdminDto, { new: true, projection: {password: 0} });


    // Delete a admin
    public deleteAdmin = async (adminID: string): Promise<any> => await this.adminModel.findByIdAndRemove(adminID);


    // manage application content
    public manageContent = async (payload: any): Promise<IContent> => this.contentModel.updateOne({}, payload);


    // add faqs
    public addFaq = async (payload: any): Promise<IFaq> => this.faqModel.insertMany(payload);


    // edit faqs
    public editFaq = async (id: string, payload: any): Promise<IFaq> => this.faqModel.findByIdAndUpdate(id, payload);


    // retrieve user request by user specific
    public getUserRequests = async (condition: any, paging: fromAdminDto.DataListDto): Promise<PaginateResult<IUserRequest>> => (
        await this.userRequestModel.paginate(condition, paging)
    )

    // update user request
    public updateUserRequestById = async (id: string, payload: fromAdminDto.ReplyUserRequestDto): Promise<IUserRequest> => (
        await this.userRequestModel.findByIdAndUpdate(id, payload)
    );

    // update multiple user request
    public updateManyRequests = async (ids: string[], payload: any): Promise<IUserRequest> => (
        await this.userRequestModel.updateMany({_id : {$in: ids} }, payload)
    );

    // update multiple user request
    public deleteManyUserRequests = async (ids: string[]): Promise<any> => (
        await this.userRequestModel.deleteMany({_id : {$in: ids} })
    );

    // update multiple user request
    public deleteManyfaqs = async (ids: string[]): Promise<any> => (
        await this.faqModel.deleteMany({_id : {$in: ids} })
    );

    // send verification code to customer email
    public sendRequestReply = async (email: string, message: string): Promise<any> => {
        return await this.nestMailerService.sendUserRequestReply( { to: email, context: { message } } );
    };

    // get multiple user request by the ids
    public getMultipleUserRequestsByIds = async (ids: string[]): Promise<IUserRequest[]> => (await this.userRequestModel.find({ _id: { $in: ids } }));

}
