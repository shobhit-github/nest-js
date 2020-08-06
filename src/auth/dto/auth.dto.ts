

import { ApiProperty } from "@nestjs/swagger";


export class ForgetPasswordDto {

    @ApiProperty({
        required: true,
        type: String
    })
    public readonly email: string
}


export class AuthDto {

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
}



export class UpdatePasswordDto {

    @ApiProperty({
        type: String
    })
    oldPassword: string;

    @ApiProperty({
        type: String
    })
    newPassword: string;
}
