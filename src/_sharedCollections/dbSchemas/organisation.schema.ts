


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from "mongoose";

import * as moment from "moment";
import { defaultProfileStatusForOrg, ProfileStatus } from "./models/profile-model";


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
        required: true
    })
    public readonly description: string;


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
        default: null
    })
    public readonly password: string;


    @Prop({
        default: [],
    })
    public readonly pictures: string[];


    @Prop({
        required: true,
        unique: true,
        default: moment().toDate()
    })
    public readonly createdAt: Date;



}

export const OrganisationSchema = SchemaFactory.createForClass(Organisation);
