

import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ProfileStatus } from '../interfaces/customer.interface';
import { CreateCustomerDto } from './create-customer.dto';

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

export class UpdateForgetPasswordFlagDto {

    @ApiProperty({
        type: Boolean
    })
    isPasswordForgot: boolean;
}


export class UpdateProfileStatusAndVerificationDto extends IntersectionType(
    UpdateVerificationCodeDto,
    UpdateProfileStatusDto,
) {}

export class UpdateCustomerInterestDto {
    @ApiProperty({
        type: Array
    })
    interests: string[];
}

export class UpdateCustomerWithTask {
    @ApiProperty({
        type: Array
    })
    listOfIds: string[];
}


