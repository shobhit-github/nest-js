

import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { ProfileStatus } from "../interfaces/organisation.interface";
import { CreateOrganisationDto } from "./create-organisation.dto";



export class UpdateProfileStatusDto {

    @ApiProperty({
        type: Object
    })
    profileStatus: ProfileStatus;
}


export class UpdateVerificationCodeDto {

    @ApiProperty({
        type: Number
    })
    verificationCode: number;
}


export class UpdateForgetPasswordFlag {


    @ApiProperty({
        required: true,
        type: Boolean
    })
    public readonly isPasswordForgot: boolean;
}



export class UpdateProfileStatusAndVerificationDto extends IntersectionType(
    UpdateVerificationCodeDto,
    UpdateProfileStatusDto,
) {}



export class UpdateOrganisationDto extends IntersectionType(
    CreateOrganisationDto,
    UpdateProfileStatusAndVerificationDto,
) {}





export class UpdateOrganisationLogoDto {

    @ApiProperty({
        required: true,
        type: 'string',
        format: 'binary'
    })
    public readonly logo: any;
}


