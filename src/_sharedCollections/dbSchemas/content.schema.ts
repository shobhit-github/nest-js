


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from "mongoose";

import * as moment from "moment";


@Schema()
export class Content extends Document {



    @Prop({
        required: true,
        type: String
    })
    public readonly privacyPolicy: string;


    @Prop({
        required: true,
        type: String
    })
    public readonly termsCondition: string;


    @Prop({
        required: true,
        type: String
    })
    public readonly about: string;




    @Prop({
        type: Date,
        default: Date.now
    })
    public readonly createdAt: Date;



}

export const ContentSchema = SchemaFactory.createForClass(Content);
