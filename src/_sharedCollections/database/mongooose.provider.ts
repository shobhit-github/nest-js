import { Injectable } from "@nestjs/common";
import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {

    constructor(private configService: ConfigService) {
    }

    public createMongooseOptions(): MongooseModuleOptions {

        return {
            uri: `mongodb+srv://${this.dbUser}:${this.dbPass}@${this.dbHost}/${this.dbName}?${this.dbSuffix}`
        };
    }



    private get dbUser(): string {
        return this.configService.get<string>('database.userName')
    };

    private get dbHost(): string {
        return this.configService.get<string>('database.hostName')
    };

    private get dbName(): string {
        return  this.configService.get<string>('database.dbName')
    };

    private get dbPass (): string {
        return this.configService.get<string>('database.password')
    };

    private get dbSuffix (): string {
        return this.configService.get<string>('database.dbSuffix')
    };
}
