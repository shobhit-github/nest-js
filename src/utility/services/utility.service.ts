import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel } from 'mongoose';
import * as fromDto from '../dto';
import { ICategory } from '../interfaces/utilities.inteface';
import { Categories } from 'src/_sharedCollections/dbSchemas/categories.schema';
import { Content } from 'src/_sharedCollections/dbSchemas/content.schema';
import { IContent, IFaq } from '../interfaces/content.interface';
import { Request as UserRequest } from '../../_sharedCollections/dbSchemas/request.schema';
import { Faq } from '../../_sharedCollections/dbSchemas/faq.schema';
import { IUserRequest } from '../interfaces/user-request.interface';



@Injectable()
export class UtilityService {


    constructor(@InjectModel(Categories.name) private readonly categoryModel: Model<ICategory>,
                @InjectModel(Content.name) private readonly contentModel: Model<IContent>,
                @InjectModel(UserRequest.name) private readonly userRequestModel: PaginateModel<IUserRequest>,
                @InjectModel(Faq.name) private readonly faqModel: Model<IFaq>) {
    }


    // get list of categories
    public getCategoryList = async (object: any): Promise<ICategory[]> => await this.categoryModel.find(object);


    // get content
    public getApplicationContent = async (selector: any): Promise<IContent> => await this.contentModel.findOne({}, selector );


    // get content
    public getApplicationFaqs = async (condition: any): Promise<IFaq[]> => await this.faqModel.find( condition );


    // add new user request
    public submitUserRequest = async (payload: fromDto.UserRequestDto): Promise<IUserRequest> => ( await new this.userRequestModel( payload ) ).save();
}
