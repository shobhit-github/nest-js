

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

