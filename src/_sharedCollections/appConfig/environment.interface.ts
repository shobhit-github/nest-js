



interface IDatabaseEnvironment {
    hostName: string
    password: string
    dbName: string
    userName: string;
    dbSuffix?: string
}

interface ISmtpSetting {
    userName: string;
    password: string;
    hostName: string;
}

interface IEmailAddress {
    verification: string;
    info: string;
    support: string;
}



export interface IEnvironment {

    database: IDatabaseEnvironment
    smtpSetting?: ISmtpSetting
    emailAddress: IEmailAddress
}
