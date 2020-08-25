import { Injectable } from "@nestjs/common";
import { PaginateModel, PaginateResult } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ICustomer } from '../interfaces/customer.interface';
import * as fromDto from "../dto/";
import { Customer } from "src/_sharedCollections/dbSchemas/customer.schema";
import { NestMailerService } from "../../_sharedCollections/mailer/nest-mailer.service";


@Injectable()
export class CustomerService {


    constructor(@InjectModel(Customer.name) private readonly customerModel: PaginateModel<ICustomer>,
                private readonly nestMailerService: NestMailerService) {

    }


    // update verification code for customer
    public updateVerificationCode = async (customerId: string, code: number): Promise<ICustomer> =>
        await this.customerModel.findByIdAndUpdate(customerId, <fromDto.UpdateVerificationCodeDto>{ verificationCode: code });


    // fetch all customers
    public getAllCustomer = async (conditions: any, paging: fromDto.ListCustomerDto): Promise<PaginateResult<ICustomer>> =>
        await this.customerModel.paginate( conditions, {...paging, select: {password: 0}} );


    // Get a single customer
    public getCustomerById = async (customerID): Promise<ICustomer> => await this.customerModel
        .findById(customerID, { password: 0 }).exec();


    // Get a single customer by object field
    public getSingleCustomer = async (object: any): Promise<any> => await this.customerModel.findOne(object).exec();


    // Get a single customer by object field
    public getSingleCustomerCategory = async (object: any): Promise<any> => await this.customerModel.findOne(object).populate('interests').exec();


    // Get a count of customer by object field
    public getCustomerCount = async (object: any): Promise<number> => await this.customerModel.count(object).exec();


    // post a single customer
    public addCustomer = async (createCustomerDTO: fromDto.CreateCustomerDto): Promise<ICustomer> =>
        (await new this.customerModel(createCustomerDTO)).save();


    // Edit customer details
    public updateCustomerById = async (customerID: string, updateCustomer: any): Promise<ICustomer> =>
        await this.customerModel
            .findByIdAndUpdate(customerID, updateCustomer, { new: true });


    // Edit customer details
    public updateCustomer = async (condition: any, updateCustomer: any): Promise<ICustomer> =>
        await this.customerModel
            .findOneAndUpdate(condition, updateCustomer, { new: true });


    // Delete a customer
    public deleteCustomer = async (customerID: string): Promise<any> => await this.customerModel.findByIdAndRemove(customerID);


    // send verification code to customer email
    public sendEmailVerification = async (customer: ICustomer, verificationCode: number): Promise<any> => {

        return await this.nestMailerService.sendEmailVerificationCode(
            {to: customer.email, context: {customerName: customer.customerName, verificationCode } }
        )
    };


    // re-send verification code to customer email
    public resendVerificationCode = async (customer: ICustomer, verificationCode: number): Promise<any> => (
        await this.nestMailerService.reSendCode({to: customer.email, context: {verificationCode } })
    );


    // do like or favour project(s)
    public saveInterests = async (customerId: string, interests: string[] ): Promise<ICustomer> => {
        return this.customerModel.findByIdAndUpdate(customerId, { interests } );
    }


    // do like or favour project(s)
    public projectFavourOrLike = async (customerId: string, projectIds: string[], field: string ): Promise<ICustomer> => {
        return this.customerModel.findByIdAndUpdate(customerId, { $push: { [field]: { $each: projectIds } } });
    }


    // do unfavoured or unlike project(s)
    public projectUnfavouredOrUnlike = async (customerId: string, projectIds: string[], field: string ): Promise<ICustomer> => {
        return this.customerModel.findByIdAndUpdate(customerId, { $pullAll: { [field]: projectIds } });
    }


    // do unfavoured or unlike project(s)
    public populateCustomer = async (customerId: string ): Promise<ICustomer> => {
        return this.customerModel.findById(customerId).populate('favouriteProjects').populate('projectsLiked');
    }




}
