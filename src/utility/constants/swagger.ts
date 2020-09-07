
interface ISwaggerDoc {
    summary: string;
    bodyDescription: string | null;
}

export const CategoryList: ISwaggerDoc = {

    summary: 'This api help to retrieve the all interests categories that will use by the customer and organisation',
    bodyDescription: null
}

export const AppContent: ISwaggerDoc = {

    summary: 'This api help to retrieve application term and conditions, about, and privacy policy',
    bodyDescription: null
}

export const FaqContent: ISwaggerDoc = {

    summary: 'This api help to retrieve application frequently question and answer for customer as well as organisation',
    bodyDescription: null
}

export const UserRequest: ISwaggerDoc = {

    summary: 'This api help to submit user request, complaint or query as per their need',
    bodyDescription: null
}

