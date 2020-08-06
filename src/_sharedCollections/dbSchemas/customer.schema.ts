


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2"

import * as moment from "moment";
import { defaultProfileStatusForCustomer, ProfileStatus } from "./models/profile-model";


@Schema()
export class Customer extends Document {



    @Prop({
        required: true
    })
    public readonly customerName: string;


    @Prop({
        required: true,
        unique: true
    })
    public readonly email: string;


    @Prop({
        required: true,
        unique: true
    })
    public readonly password: string;


    @Prop({
        type: Object,
        required: true,
        default: defaultProfileStatusForCustomer
    })
    public readonly profileStatus: ProfileStatus;


    @Prop({
        type: Number,
        default: null
    })
    public readonly verificationCode: number | null;


    @Prop({
        type: Number,
        default: false
    })
    public readonly isPasswordForgot: boolean;


    @Prop({
        required: true,
        default: moment().toDate()
    })
    public readonly createdAt: Date;



}


export const CustomerSchema = SchemaFactory.createForClass(Customer)

.plugin(mongoosePaginate);


