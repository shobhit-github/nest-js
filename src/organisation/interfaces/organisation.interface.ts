
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
    readonly description?: string;
    readonly profileStatus?: ProfileStatus;
    readonly verificationCode?: null | number;
    readonly isPasswordForgot?: boolean;
    readonly createdAt: Date | string;
}


export interface IOrganisationWithPassword extends IOrganisation {

    readonly password: string;
}

