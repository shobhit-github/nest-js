

import { ApiProperty, PickType } from '@nestjs/swagger';


export class CreateOrganisationDto {



    @ApiProperty({
        required: true,
        type: String
    })
    public readonly organisationName: string;


    @ApiProperty({
        required: true,
        type: String,
    })
    public readonly email: string;


    @ApiProperty({
        required: true,
        type: String
    })
    public readonly address: string;


    @ApiProperty({
        required: true,
        type: String
    })
    public readonly phone: string;

}

export class CreateOrganisationProfileDto extends PickType(CreateOrganisationDto, ['organisationName'] as const)  {


    @ApiProperty({
        type: String
    })
    public readonly description: string;


    @ApiProperty({
        required: true,
        type: 'string',
        format: 'binary'
    })
    public readonly pictures: any[];

}

