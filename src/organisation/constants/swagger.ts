
interface ISwaggerDoc {
    summary: string;
    bodyDescription: string | null;
}

export const CreateOrganisation: ISwaggerDoc = {

    summary: 'This api help to create a new organisation to get new donations',
    bodyDescription: null
}


export const UpdateOrganisation: ISwaggerDoc = {

    summary: 'This api help to change / update a existing organisation to get new donations',
    bodyDescription: null
}


export const ApproveProfile: ISwaggerDoc = {

    summary: 'This API will help to verify the organisation profile and send the credential to the email',
    bodyDescription: null
}


export const CompleteProfile: ISwaggerDoc = {

    summary: 'This api will help to complete the organisation profile',
    bodyDescription: null
}


export const UploadLogo: ISwaggerDoc = {

    summary: 'This API will provide the facility to update organisation logo',
    bodyDescription: null
}


export const CreateProject: ISwaggerDoc = {

    summary: 'Create a new project to get new donation for an organisation',
    bodyDescription: null
}


export const UploadProjectPics: ISwaggerDoc = {

    summary: 'This api will help to upload project timeline pictures of the organisation profile',
    bodyDescription: null
}

export const UserRequest: ISwaggerDoc = {

    summary: 'This api help to submit user request, complaint or query as per their need',
    bodyDescription: null
}

export const OrgProfile: ISwaggerDoc = {

    summary: 'This api help retrieve the simple organisation profile by id',
    bodyDescription: null
}


