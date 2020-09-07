

import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { ProfileStatus } from "../interfaces/customer.interface";




class CardDetails {


    @ApiProperty({
        required: true,
        type: String,
        default: '123'
    })
    public readonly cvc: string;


    @ApiProperty({
        required: true,
        type: String,
        default: '03'
    })
    public readonly expiryMonth: string;


    @ApiProperty({
        required: true,
        type: String,
        default: '2020'
    })
    public readonly expiryYear: string;


    @ApiProperty({
        required: true,
        type: String,
        default: 'Customer Name'
    })
    public readonly holderName: string;


    @ApiProperty({
        required: true,
        type: String,
        default: '4111411141114111'
    })
    public readonly number: string;

}
class AmountDetails {


    @ApiProperty({
        required: true,
        type: Number,
        default: 5000
    })
    public readonly value: number;


    @ApiProperty({
        required: true,
        type: String,
        default: 'USD'
    })
    public readonly currency: string;

}

class PaymentDetails {


    @ApiProperty({
        required: true,
        type: CardDetails
    })
    public readonly card: CardDetails;


    @ApiProperty({
        required: true,
        type: AmountDetails
    })
    public readonly amount: AmountDetails;

}


export class OneTimeCardPaymentDto {


    @ApiProperty({
        required: true,
        type: String
    })
    public readonly customer_id: string;


    @ApiProperty({
        required: true,
        type: String,
    })
    public readonly organisation_id: string;


    @ApiProperty({
        required: true,
        type: PaymentDetails
    })
    public readonly paymentDetails: PaymentDetails;


}







