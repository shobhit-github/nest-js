

import { ApiProperty } from "@nestjs/swagger";


export class UserRequestDto {



    @ApiProperty({
        required: true,
        type: String
    })
    public readonly fullName: string;


    @ApiProperty({
        required: true,
        type: String,
    })
    public readonly email: string;


    @ApiProperty({
        type: String
    })
    public readonly phone: string;


    @ApiProperty({
        required: true,
        type: String,
    })
    public readonly subject: string;


    @ApiProperty({
        required: true,
        type: String,
    })
    public readonly message: string;


}






