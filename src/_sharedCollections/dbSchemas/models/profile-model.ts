import { Prop } from "@nestjs/mongoose";



export class ProfileStatus {

    @Prop({
        required: true,
        default: true
    })
    public readonly isActive: boolean;


    @Prop({
        required: true,
        default: false
    })
    public readonly isVerified: boolean;


    @Prop({
        required: true,
        default: false
    })
    public readonly isSuspended: boolean;


    @Prop({
        default: false,
        required: true
    })
    public readonly isProfileApproved?: boolean;


    @Prop({
        default: false,
        required: true
    })
    public readonly isLoggedIn?: boolean;
}


export const defaultProfileStatusForCustomer: ProfileStatus = {

    isActive: true,
    isSuspended: false,
    isVerified: false,
    isProfileApproved: true,
    isLoggedIn: false
};

export const defaultProfileStatusForOrg: ProfileStatus = {

    isActive: true,
    isSuspended: false,
    isVerified: false,
    isProfileApproved: false,
    isLoggedIn: false
};
