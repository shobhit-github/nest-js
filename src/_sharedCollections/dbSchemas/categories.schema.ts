


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from "mongoose";



@Schema()
export class Categories extends Document {



    @Prop({
        required: true
    })
    public readonly category: string;




}

export const CategorySchema = SchemaFactory.createForClass(Categories);
