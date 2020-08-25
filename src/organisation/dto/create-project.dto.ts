

import { ApiProperty } from '@nestjs/swagger';


export class CreateProjectDto {



    @ApiProperty({
        required: true,
        type: String
    })
    public readonly projectName: string;


    @ApiProperty({
        required: true,
        type: String,
    })
    public readonly description: string;


    @ApiProperty({
        required: true,
        type: Number
    })
    public readonly targetBudget: number;


}



export class UpdateProjectPictureDto {


    @ApiProperty({
        required: true,
        items: {
            type: 'file',
            format: 'binary'
        },
        type: 'array'
    })
    public readonly pictures: any[];

}



