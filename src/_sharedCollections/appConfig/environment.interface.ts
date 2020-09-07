



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

interface IPaymentGateway {
    apiKey: string;
    merchantAccountId: string;
}



export interface IEnvironment {
    environment: 'DEV' | 'STAGE' | 'PROD';
    database: IDatabaseEnvironment
    smtpSetting?: ISmtpSetting
    emailAddress: IEmailAddress
    paymentGateway: IPaymentGateway
}
