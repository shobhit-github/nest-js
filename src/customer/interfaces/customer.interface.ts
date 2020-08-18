

import { Document } from 'mongoose';


export interface ProfileStatus {

    readonly isActive: boolean;
    readonly isSuspended: boolean;
    readonly isVerified: boolean;
    readonly isProfileApproved?: boolean;
}


export interface ICustomer extends Document {

    readonly _id: string;
    readonly customerName: string;
    readonly email: string;
    readonly profileStatus?: ProfileStatus;
    readonly verificationCode?: null | number;
    readonly isPasswordForgot?: boolean;
    readonly createdAt: Date | string;
}

export interface ICustomerWithPassword extends ICustomer {

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
