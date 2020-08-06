import { DocumentBuilder } from "@nestjs/swagger";
import * as environmentConfiguration from "./_sharedCollections/appConfig/environment";


const ENV_TYPE: ( 'production' | 'development' | 'staging' | string ) = process.env.NODE_ENV || 'development';




export const SwaggerDocumentOptions = new DocumentBuilder()
    .setTitle("Givmo - REST API Documentation")
    .setDescription("This project is a Mobile application designed to help customers make donations and find organizations to donate money to. Customers are going to be able to indicate their interests, and go to a recommended page which will show them organizations that relate to their interests.\n\n\n\n" +
        "The customer can set an amount per month that they would like to send to an organization so that every month, their payment method gets automatically charged. Lastly, the customer can make a one time payment to an organization. The admin is going to take out a processing fee on the organization side when a payment is made")
    .setVersion("1.0")
    .setContact("Shobhit Sharma", null, "shobhit.sharma@smartdatainc.net")
    .addBearerAuth()
    .build();



export default (  ): environmentConfiguration.IEnvironment => {

    return ({
        development: environmentConfiguration.DevelopmentConfigurations,
        staging: environmentConfiguration.StagingConfigurations,
        production: environmentConfiguration.ProductionConfigurations
    })
        [ ENV_TYPE ]
};
