

import { Document } from 'mongoose';
import { IOrganisation } from '../../organisation/interfaces/organisation.interface';
import { IProject } from '../../organisation/interfaces/project.interface';
import { ICustomer } from './customer.interface';



export interface IDonation extends Document {

    readonly _id: string;
    readonly customer: ICustomer;
    readonly organisation: IOrganisation;
    readonly project: IProject | null;
    readonly amount: any;
    readonly currency: string;
    readonly refundStatus?: boolean;
    readonly donationType?: 'ONE-TIME' | 'RECURRING';
    readonly adyenTransactionDetails?: any;
    readonly createdAt: Date | string;
}
