import { Prop } from "@nestjs/mongoose";



export class ProjectStatus {

    @Prop({
        required: true,
        default: true
    })
    public readonly isActive: boolean;


    @Prop({
        required: true,
        default: false
    })
    public readonly isSuspended: boolean;


    @Prop({
        default: false,
        required: true
    })
    public readonly isProjectApproved?: boolean;


}





export const defaultProjectStatus: ProjectStatus = {

    isActive: true,
    isSuspended: false,
    isProjectApproved: true,
};
