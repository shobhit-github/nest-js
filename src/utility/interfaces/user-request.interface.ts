

import { Document } from 'mongoose';



export interface IUserRequest extends Document {

    readonly _id: string;
    readonly organisation?: string | null;
    readonly customer?: string | null;
    readonly fullName?: string;
    readonly email: string;
    readonly phone?: string;
    readonly subject: string;
    readonly message: string;
    readonly createdAt: Date | string
}

