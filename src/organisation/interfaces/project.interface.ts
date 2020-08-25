
import { Document } from 'mongoose';
import { IOrganisation } from './organisation.interface';


export interface ProjectStatus {

    readonly isActive: boolean;
    readonly isSuspended: boolean;
    readonly isVerified: boolean;
    readonly isProfileApproved?: boolean;
}


export interface IProject extends Document {

    readonly _id: string;
    readonly projectName: string;
    readonly description?: string;
    readonly projectStatus?: ProjectStatus;
    readonly projectPictures?: string[];
    readonly organisation?: IOrganisation | string;
    readonly createdAt: Date | string;
    readonly targetBudget: number;
    readonly likes: number;
}



export interface FilterFileOptions {
    readonly fieldname: string;
    readonly originalname: string;
    readonly encoding: string;
    readonly mimetype: string;
    readonly size: number;
    readonly destination: string;
    readonly filename: string;
    readonly path: string;
    readonly buffer: Buffer
}
