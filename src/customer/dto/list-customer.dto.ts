

import { ApiProperty } from "@nestjs/swagger";


export class ListCustomerDto {


    @ApiProperty({
        type: Object,
        example: {}
    })
    public readonly query?: any;


    @ApiProperty({
        required: true,
        type: Number,
        example: 1
    })
    public readonly page: number;


    @ApiProperty({
        required: true,
        type: Number,
        example: 10
    })
    public readonly limit: number;

}
