import { IEnvironment } from "./environment.interface";


export const DevelopmentConfigurations: IEnvironment = {

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
    }
};


export const StagingConfigurations: IEnvironment = {

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
    }
};

export const ProductionConfigurations: IEnvironment = {

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
    }
};

export * from './environment.interface';
