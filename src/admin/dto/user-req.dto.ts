import { ApiProperty } from '@nestjs/swagger';

export class ReplyUserRequestDto {


    @ApiProperty({
        required: true,
        type: String
    })
    public readonly messageResponse: string;


    @ApiProperty({
        required: true,
        type: String
    })
    public readonly requestStatus: 'OPEN' | 'CLOSED' | 'RESOLVED';



}
