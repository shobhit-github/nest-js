import { forwardRef, Module } from '@nestjs/common';
import { AuthenticationController } from "./controllers/authentication.controller";
import { AuthenticationService } from "./services/authentication.service";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { CustomerModule } from "../customer/customer.module";
import { AdminModule } from "../admin/admin.module";
import { OrganisationModule } from "../organisation/organisation.module";
import { NestMailerService } from "../_sharedCollections/mailer/nest-mailer.service";
import { JwtStrategy } from './guard/jwt.strategy';
import { JwtAuthGuard, PermissionGuard } from './guard/permission.guard';


export const jwtConstants = {
    JWT_SECRET: "qeD`i3AHn'MbR)H[DS>'<7(YxNpX,8M`>]m6LA/s",
    TOKEN_EXPIRE: "7d"
};


@Module({
    controllers: [AuthenticationController],
    providers: [
        AuthenticationService, NestMailerService, PermissionGuard, JwtStrategy, JwtAuthGuard
    ],
    imports: [
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.JWT_SECRET,
            signOptions: { expiresIn: jwtConstants.TOKEN_EXPIRE }
        }),
        JwtStrategy,
        forwardRef( () => CustomerModule),
        AdminModule,
        OrganisationModule
    ],
    exports: [AuthenticationService, PermissionGuard, JwtStrategy, JwtAuthGuard]
})
export class AuthModule {
}
