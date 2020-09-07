


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Customer } from './customer.schema';
import { Organisation } from './organisation.schema';


@Schema()
export class Request extends Document {



    @Prop({
        type: MongooseSchema.Types.ObjectId,
        default: null,
        ref: Customer.name
    })
    public readonly customer: Customer;


    @Prop({
        type: MongooseSchema.Types.ObjectId,
        default: null,
        ref: Organisation.name
    })
    public readonly organisation: Organisation;


    @Prop({
        required: true,
        type: String
    })
    public readonly fullName: string;


    @Prop({
        required: true,
        type: String
    })
    public readonly email: string;


    @Prop({
        type: String
    })
    public readonly phone: string;


    @Prop({
        required: true,
        type: String
    })
    public readonly subject: string;


    @Prop({
        required: true,
        type: String
    })
    public readonly message: string;




    @Prop({
        type: Date,
        default: Date.now
    })
    public readonly createdAt: Date;



}

export const RequestSchema = SchemaFactory.createForClass(Request);