


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { defaultProfileStatusForOrg, ProfileStatus } from "./models/profileStatus-model";
import { Categories } from './categories.schema';
import { Project } from './project.schema';


@Schema()
export class Organisation extends Document {



    @Prop({
        required: true
    })
    public readonly organisationName: string;


    @Prop({
        default: null
    })
    public readonly organisationLogo: string;


    @Prop({
        type: String
    })
    public readonly description: string;


    @Prop([
        {
            type: MongooseSchema.Types.ObjectId,
            default: [],
            ref: Categories.name
        }
    ])
    public readonly interests: Categories[];


    @Prop({
        default: null
    })
    public readonly phone: string;


    @Prop({
        required: true,
        unique: true
    })
    public readonly email: string;


    @Prop({
        required: true,
        type: Object,
        default: defaultProfileStatusForOrg
    })
    public readonly profileStatus: ProfileStatus;


    @Prop({
        required: true,
        default: false
    })
    public readonly isPasswordForgot: boolean;


    @Prop({
        default: null,
        type: String,
    })
    public readonly password: string;


    @Prop({
        default: [],
    })
    public readonly pictures: string[];


    @Prop({
        type: Date,
        default: Date.now
    })
    public readonly createdAt: Date;


}

export const OrganisationSchema = SchemaFactory.createForClass(Organisation);
