


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from "mongoose";



@Schema()
export class Faq extends Document {



    @Prop({
        required: true,
        type: String
    })
    public readonly questionFor: 'CUSTOMER' | 'ORGANISATION';


    @Prop({
        required: true,
        type: String
    })
    public readonly question: string;


    @Prop({
        required: true,
        type: String
    })
    public readonly answer: string;




    @Prop({
        type: Date,
        default: Date.now
    })
    public readonly createdAt: Date;



}

export const FaqSchema = SchemaFactory.createForClass(Faq);
