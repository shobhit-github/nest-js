import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICategory } from '../interfaces/utilities.inteface';
import { Categories } from 'src/_sharedCollections/dbSchemas/categories.schema';



@Injectable()
export class UtilityService {


    constructor(@InjectModel(Categories.name) private readonly categoryModel: Model<ICategory>) {
    }


    // get list of categories
    public getCategoryList = async (object: any): Promise<ICategory[]> => await this.categoryModel.find(object);
}
