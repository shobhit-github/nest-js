

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



export class SaveProjectDto extends CreateProjectDto {


    @ApiProperty({
        type: String,
        required: true
    })
    public readonly projectPictures: string[];


    @ApiProperty({
        type: 'array',
        required: true
    })
    public readonly organisation: string;

}


export class CreateOrganisationProjectDto extends CreateProjectDto  {


    @ApiProperty({
        required: true,
        items: {
            type: 'file',
            format: 'binary'
        },
        type: 'array'
    })
    public readonly projectPictures: any[];

}


