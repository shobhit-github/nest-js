

import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { ProfileStatus } from "../interfaces/customer.interface";


export class CreateCustomerDto {



    @ApiProperty({
        required: true,
        type: String
    })
    public readonly customerName: string;


    @ApiProperty({
        required: true,
        type: String,
    })
    public readonly email: string;


    @ApiProperty({
        required: true,
        type: String
    })
    public readonly password: string;

}






