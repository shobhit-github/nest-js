

import { Document } from 'mongoose';



export interface IAdmin extends Document {

    readonly _id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly username: string;
    readonly phone: number | string
    readonly createdAt: Date | string
}



export interface IAdminWithPassword extends IAdmin {

    readonly password: string
}
