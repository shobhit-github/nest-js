

export interface IJwtToken {
    access_token: string
}


export interface IUserEmail {
    email: string
}


export interface IUserLogin extends IUserEmail {
    _id: string
}
