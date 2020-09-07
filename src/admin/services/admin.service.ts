


import { Injectable } from '@nestjs/common';
import { Model, PaginateModel } from 'mongoose';
import { InjectModel } from "@nestjs/mongoose";
import { IAdmin } from '../interfaces/admin.interface';
import { Admin } from '../../_sharedCollections/dbSchemas/admin.schema';

import * as fromAdminDto from "../dto";
import { Content } from 'src/_sharedCollections/dbSchemas/content.schema';
import { IContent, IFaq } from '../interfaces/content.interface';
import { Faq } from '../../_sharedCollections/dbSchemas/faq.schema';
import { IUserRequest } from '../interfaces/user-request.interface';
import { Request as UserRequest } from '../../_sharedCollections/dbSchemas/request.schema';


@Injectable()
export class AdminService {


    constructor(@InjectModel(Admin.name) private readonly adminModel: Model<IAdmin>,
                @InjectModel(Content.name) private readonly contentModel: Model<IContent>,
                @InjectModel(UserRequest.name) private readonly userRequestModel: PaginateModel<IUserRequest>,
                @InjectModel(Faq.name) private readonly faqModel: Model<IFaq>) {
    }


    // fetch all admins
    public getAllAdmin = async(): Promise<IAdmin[]> => await this.adminModel
        .find(null, {password: 0}).exec();


    // Get a single admin
    public getAdminById = async (adminID): Promise<IAdmin> => await this.adminModel
        .findById(adminID, {password: 0}).exec();


    // Get a single admin by object field
    public getSingleAdmin = async (object: any): Promise<IAdmin | any> => await this.adminModel.findOne(object).exec();


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


}
