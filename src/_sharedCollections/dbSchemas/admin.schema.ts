


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from "mongoose";

import * as moment from "moment";


@Schema()
export class Admin extends Document {



    @Prop({
        required: true
    })
    public readonly firstName: string;


    @Prop({
        required: true
    })
    public readonly lastName: string;


    @Prop({
        required: true,
        unique: true
    })
    public readonly email: string;


    @Prop({
        required: true,
        unique: true
    })
    public readonly username: string;


    @Prop({
        required: true,
        unique: true
    })
    public readonly phone: string;


    @Prop({
        required: true,
    })
    public readonly password: string;


    @Prop({
        required: true,
        default: false
    })
    public readonly isPasswordForgot: boolean;


    @Prop({
        required: true,
        default: moment().toDate()
    })
    public readonly createdAt: Date;



}

export const AdminSchema = SchemaFactory.createForClass(Admin);
