

import { ApiProperty } from "@nestjs/swagger";


export class DataListDto {


    @ApiProperty({
        type: Object,
        example: {}
    })
    public readonly query?: any;


    @ApiProperty({
        type: Number,
        example: 1
    })
    public readonly page?: number;


    @ApiProperty({
        type: Number,
        example: 0
    })
    public readonly offset?: number;


    @ApiProperty({
        type: Number,
        example: 10
    })
    public readonly limit: number;

}
