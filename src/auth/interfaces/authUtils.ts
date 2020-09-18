

export interface IJwtToken {
    access_token: string
}


export interface IUserEmail {
    email: string
}


export interface IUserLogin extends IUserEmail {
    _id: string
}

export enum UserType {
    CUSTOMER= 'customer',
    ADMIN = 'admin',
    ORGANISATION = 'organisation'
}
