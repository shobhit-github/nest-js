
import { Document } from 'mongoose';


export interface ProfileStatus {

    readonly isActive: boolean;
    readonly isSuspended: boolean;
    readonly isVerified: boolean;
    readonly isProfileApproved?: boolean;
}


export interface IOrganisation extends Document {

    readonly _id: string;
    readonly organisationName: string;
    readonly email: string
    readonly phone: string | number;
    readonly description?: string;
    readonly interests?: string[];
    readonly profileStatus?: ProfileStatus;
    readonly verificationCode?: null | number;
    readonly isPasswordForgot?: boolean;
    readonly createdAt: Date | string;
    readonly pictures?: string[];
    readonly organisationLogo?: string;
}


export interface IOrganisationWithPassword extends IOrganisation {

    readonly password: string;
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
