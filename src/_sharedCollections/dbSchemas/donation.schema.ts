


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';


import { Organisation } from './organisation.schema';
import { Customer } from './customer.schema';
import { Project } from './project.schema';


@Schema()
export class Donation extends Document {



    @Prop({
        required: true,
        type: MongooseSchema.Types.ObjectId,
        default: null,
        ref: Customer.name
    })
    public readonly customer: Customer;


    @Prop({
        required: true,
        type: MongooseSchema.Types.ObjectId,
        default: null,
        ref: Organisation.name
    })
    public readonly organisation: Organisation;


    @Prop({
        type: MongooseSchema.Types.ObjectId,
        default: null,
        ref: Project.name
    })
    public readonly project: Project;


    @Prop({
        required: true,
        type: Boolean,
        default: false
    })
    public readonly refundStatus: boolean;


    @Prop({
        required: true,
        type: Number
    })
    public readonly amount: number;


    @Prop({
        required: true,
        type: String
    })
    public readonly currency: string;


    @Prop({
        required: true,
        type: String
    })
    public readonly donationType: 'ONE-TIME' | 'RECURRING';


    @Prop({
        required: true,
        type: Object
    })
    public readonly adyenTransactionDetails: any;


    @Prop({
        type: Date,
        default: Date.now
    })
    public readonly createdAt: Date;



}

export const DonationSchema = SchemaFactory.createForClass(Donation);
