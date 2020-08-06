

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
