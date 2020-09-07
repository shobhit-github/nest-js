

import { ApiProperty } from '@nestjs/swagger';

export class FaqDto {

    @ApiProperty({
        required: true,
        type: String
    })
    public readonly question: string;

    @ApiProperty({
        required: true,
        type: String
    })
    public readonly answer: string;



}
