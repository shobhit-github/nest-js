


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';


import { defaultProjectStatus, ProjectStatus } from './models/projectStatus-model';
import { Organisation } from './organisation.schema';


@Schema()
export class Project extends Document {



    @Prop({
        required: true
    })
    public readonly projectName: string;


    @Prop({
        default: 0
    })
    public readonly targetBudget: number;


    @Prop({
        type: String
    })
    public readonly description: string;


    @Prop({
        required: true,
        type: Object,
        default: defaultProjectStatus
    })
    public readonly projectStatus: ProjectStatus;


    @Prop({
        required: true,
        type: MongooseSchema.Types.ObjectId,
        default: null,
        ref: Organisation.name
    })
    public readonly organisation: Organisation;


    @Prop({
        default: [],
    })
    public readonly projectPictures: string[];


    @Prop({
        default: 0,
    })
    public readonly likes: number;


    @Prop({
        type: Date,
        default: Date.now
    })
    public readonly createdAt: Date;



}

export const ProjectSchema = SchemaFactory.createForClass(Project);
