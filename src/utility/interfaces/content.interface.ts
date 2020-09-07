

import { Document } from 'mongoose';



export interface IContent extends Document {

    readonly _id: string;
    readonly privacyPolicy?: string;
    readonly termsCondition?: string;
    readonly about: string;
    readonly createdAt: Date | string
}


export interface IFaq extends Document {

    readonly _id: string;
    readonly questionFor: 'CUSTOMER' | 'ORGANISATION';
    readonly question: string;
    readonly answer: string;
    readonly createdAt: Date | string
}


