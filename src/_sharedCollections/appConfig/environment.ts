import { IEnvironment } from "./environment.interface";


export const DevelopmentConfigurations: IEnvironment = {

    environment: 'DEV',

    database: {
        dbName: 'Givmo',
        hostName: 'development.obesu.mongodb.net',
        password: 'crow1000',
        userName: 'shobhit',
        dbSuffix: 'retryWrites=true&w=majority'
    },
    smtpSetting: {
        userName: 'developmentfreeks@gmail.com',
        password: 'crow1000',
        hostName: 'smtp.gmail.com'
    },
    emailAddress: {
        verification: 'verfication@givmo.com',
        info: 'info@givmo.com',
        support: 'support@givmo.com'
    },
    paymentGateway: {
        apiKey: 'AQEnhmfuXNWTK0Qc+iSes0U7pOuORp8dWsVgq0kvvUTBHP/cxsjMxm+sEMFdWw2+5HzctViMSCJMYAc=-zF7Dm0LLUgqre317IR4DEiinz8lOBQCu0zFe7JTo4aM=-P>8c>68e+T,ta34F',
        merchantAccountId: 'NAAccount076ECOM'
    }
};


export const StagingConfigurations: IEnvironment = {

    environment: 'STAGE',

    database: {
        dbName: 'Givmo',
        hostName: 'development.obesu.mongodb.net',
        password: 'crow1000',
        userName: 'shobhit',
        dbSuffix: 'retryWrites=true&w=majority'
    },
    smtpSetting: {
        userName: 'developmentfreeks@gmail.com',
        password: 'crow1000',
        hostName: 'smtp.gmail.com'
    },
    emailAddress: {
        verification: 'verfication@givmo.com',
        info: 'info@givmo.com',
        support: 'support@givmo.com'
    },
    paymentGateway: {
        apiKey: null,
        merchantAccountId: null
    }
};

export const ProductionConfigurations: IEnvironment = {

    environment: 'PROD',

    database: {
        dbName: 'Givmo',
        hostName: 'development.obesu.mongodb.net',
        userName: 'shobhit',
        password: 'crow1000',
        dbSuffix: 'retryWrites=true&w=majority'
    },
    smtpSetting: {
        userName: 'developmentfreeks@gmail.com',
        password: 'crow1000',
        hostName: 'smtp.gmail.com'
    },
    emailAddress: {
        verification: 'verfication@givmo.com',
        info: 'info@givmo.com',
        support: 'support@givmo.com'
    },
    paymentGateway: {
        apiKey: null,
        merchantAccountId: null
    }
};

export * from './environment.interface';
