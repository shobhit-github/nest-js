
interface ISwaggerDoc {
    summary: string;
    bodyDescription: string | null;
}

export const Dashboard: ISwaggerDoc = {

    summary: 'This api will provide the all statistical data that will be shown to the admin dashboard',
    bodyDescription: null
}


export const CreateAdmin: ISwaggerDoc = {

    summary: 'This api for add new admin account',
    bodyDescription: null
}


export const AdminProfile: ISwaggerDoc = {

    summary: 'This api help to retrieve the admin profile by admin id',
    bodyDescription: null
}


export const UpdateProfile: ISwaggerDoc = {

    summary: 'This api help to update the existing admin profile by admin id and payload',
    bodyDescription: null
}



export const AddNewFaq: ISwaggerDoc = {

    summary: 'This api help to add new frequently asked question for customer and organisation',
    bodyDescription: null
}



export const EditNewFaq: ISwaggerDoc = {

    summary: 'This api help to edit existing frequently asked question for customer or organisation',
    bodyDescription: null
}

