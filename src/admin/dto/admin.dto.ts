

import { ApiProperty, OmitType } from '@nestjs/swagger';

export class CreateAdminDto {

    @ApiProperty({
        required: true,
        type: String
    })
    public readonly firstName: string;

    @ApiProperty({
        required: true,
        type: String
    })
    public readonly lastName: string;

    @ApiProperty({
        required: true,
        type: String
    })
    public readonly email: string;

    @ApiProperty({
        required: true,
        type: String
    })
    public readonly username: string;

    @ApiProperty({
        required: true,
        type: String
    })
    public readonly password: string;

    @ApiProperty({
        required: true,
        type: String
    })
    public readonly phone: string;


}


export class UpdateAdminDto extends OmitType(CreateAdminDto, ['password', 'username'] as const) {}



export class UpdateForgetPasswordFlag {


    @ApiProperty({
        required: true,
        type: Boolean
    })
    public readonly idPasswordForgot: boolean;
}


export class UpdateContentDto {


    @ApiProperty({
        required: true,
        type: Object
    })
    public readonly contentValue: any;
}








