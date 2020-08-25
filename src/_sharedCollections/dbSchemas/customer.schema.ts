


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import * as mongoosePaginate from "mongoose-paginate-v2"

import { defaultProfileStatusForCustomer, ProfileStatus } from "./models/profileStatus-model";
import { Categories } from './categories.schema';
import { Project } from './project.schema';


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


    @Prop([
        {
            type: MongooseSchema.Types.ObjectId,
            default: [],
            ref: Categories.name
        }
    ])
    public readonly interests: Categories[];


    @Prop([
        {
            type: MongooseSchema.Types.ObjectId,
            default: [],
            ref: Project.name
        }
    ])
    public readonly favouriteProjects: Project[];


    @Prop([
        {
            type: MongooseSchema.Types.ObjectId,
            default: [],
            ref: Project.name
        }
    ])
    public readonly projectsLiked: Project[];


    @Prop({
        type: Date,
        default: Date.now
    })
    public readonly createdAt: Date;



}


export const CustomerSchema = SchemaFactory.createForClass(Customer).plugin(mongoosePaginate);


