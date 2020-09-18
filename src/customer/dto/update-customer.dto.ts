

import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { ProfileStatus } from '../interfaces/customer.interface';
import { CreateCustomerDto } from './create-customer.dto'
import {UserRequestDto} from '../../utility/dto';

export * from '../../utility/dto';


export class UpdateCustomerDto extends OmitType(CreateCustomerDto, ['password'] as const) {}


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


export class CustomerIdDto {
    @ApiProperty({
        type: String
    })
    customer: string;
}


export class CustomerUserRequestDto extends IntersectionType(
    CustomerIdDto,
    UserRequestDto,
) {}

export class UpdateMultipleSets {

    @ApiProperty({
        type: Array
    })
    ids: string[]

    @ApiProperty({
        type: Object
    })
    fieldObject: any
}
