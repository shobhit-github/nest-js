

import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { UserRequestDto } from '../../utility/dto';


export * from '../../utility/dto';



export class UpdateVerificationCodeDto {

    @ApiProperty({
        type: Number
    })
    verificationCode: number;
}





export class UpdateOrganisationLogoDto {

    @ApiProperty({
        required: true,
        type: 'string',
        format: 'binary'
    })
    public readonly logo: any;
}




export class OrganisationIdDto {
    @ApiProperty({
        type: String
    })
    organisation: string;
}


export class OrganisationUserRequestDto extends IntersectionType(
    OrganisationIdDto,
    UserRequestDto,
) {}


