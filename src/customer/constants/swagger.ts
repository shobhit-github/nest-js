
interface ISwaggerDoc {
    summary: string;
    bodyDescription: string | null;
}

export const OrganisationPayment: ISwaggerDoc = {

    summary: 'This API will help to make donation to an organizations in the form of recurring or one-time',
    bodyDescription: 'In the body object cvc will have 3 digit of code as string and expiry month will have 2 digit there 03 = March and 11 = November'
}

export const PaymentMethods: ISwaggerDoc = {

    summary: 'This API will help to retrieve the payment methods based on the country code',
    bodyDescription: 'In the request parameter you will have 2 char of country code for example IN = India and US = U.S.A. Here we are using ISO Alpha-2 code Please check this link https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2'
}


export const CreateCustomer: ISwaggerDoc = {

    summary: 'This api help to create a new customer for new donations',
    bodyDescription: null
}


export const UpdateCustomer: ISwaggerDoc = {

    summary: 'This api help to update an existing customer for new donations',
    bodyDescription: null
}


export const ConfirmVerification: ISwaggerDoc = {

    summary: 'Verification code confirmation help to go head in the app',
    bodyDescription: null
}


export const ResendCode: ISwaggerDoc = {

    summary: 'Resend verification code if the code have not received yet',
    bodyDescription: null
}


export const CustomerList: ISwaggerDoc = {

    summary: 'Retrieve customer data list with paginated format',
    bodyDescription: null
}


export const CustomerProfile: ISwaggerDoc = {

    summary: 'This api will help to retrieve single customer profile by customer id',
    bodyDescription: null
}


export const RecommendationList: ISwaggerDoc = {

    summary: 'Update and Retrieve project and organisation recommendation with the help of customer interests',
    bodyDescription: null
}


export const RecommendedOrganisation: ISwaggerDoc = {

    summary: 'This api help to retrieve to get the recommended organisations based on customer interests',
    bodyDescription: null
}


export const RecommendedProject: ISwaggerDoc = {

    summary: 'This api help to retrieve to get the recommended projects based on customer interests',
    bodyDescription: null
}


export const LikeFavour: ISwaggerDoc = {

    summary: 'This api will help to make like, unlike, bookmark and unbooked to a particular project by the customer',
    bodyDescription: 'This API can perform many tasks ( for-example: like, unlike, favourite, unfavoured project and save interest as well). Here you will have to use the project Ids for like, unlike, favourite, unfavoured tasks and use category ids for interest task'
}


export const UserRequest: ISwaggerDoc = {

    summary: 'This api help to submit user request, complaint or query as per their need',
    bodyDescription: null
}

