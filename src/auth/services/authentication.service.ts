import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CustomerService } from "../../customer/services/customer.service";
import { AdminService } from "../../admin/services/admin.service";


import * as bCrypt from 'bcrypt';
import { NestMailerService } from "../../_sharedCollections/mailer/nest-mailer.service";
import { OrganisationService } from "../../organisation/services/organisation.service";
import { IUserEmail } from "../interfaces/authUtils";




@Injectable()
export class AuthenticationService {


    constructor(private readonly jwtService: JwtService,
                private readonly customerService: CustomerService,
                private readonly adminService: AdminService,
                private readonly organisationService: OrganisationService,
                private readonly nestMailerService: NestMailerService) {
    }


    private static async comparePassword (password1: string, password2: string): Promise<boolean> {

        return await bCrypt.compare(password2, password1)
    }


    public async validateOrganisation(username: string, pass: string): Promise<any> {
        const userObject: any = await this.organisationService.getSingleOrganisation(username);
        const isPasswordCorrect: boolean = userObject ? await AuthenticationService.comparePassword(userObject.password, pass) : false;

        if (userObject && isPasswordCorrect) {
            return userObject;
        }
        return null;
    }


    public async validateCustomer(username: string, pass: string): Promise<any> {
        const userObject: any = await this.customerService.getSingleCustomer({email: username});
        const isPasswordCorrect: boolean = userObject ? await AuthenticationService.comparePassword(userObject.password, pass) : false;

        if (userObject && isPasswordCorrect) {
            return userObject;
        }
        return null;
    }


    public async validateAdmin(username: string, pass: string): Promise<any> {
        const userObject: any = await this.adminService.getSingleAdmin({username});
        const isPasswordCorrect: boolean = userObject ? await AuthenticationService.comparePassword(userObject.password, pass) : false;

        if (userObject && isPasswordCorrect) {
            return userObject;
        }
        return null;
    }


    public loginUser(user: any, role: 'customer' | 'admin' | 'organisation'): {access_token: string} {

        return {
            access_token: this.jwtService.sign({ username: user.email, sub: user._id, role })
        };
    }


    public isPasswordMatched = async (p1: string, p2: string): Promise<boolean> => !!(await AuthenticationService.comparePassword(p1, p2));


    public async sendForgetPasswordRequest(userInfo: IUserEmail, generatedPassword: string) {

        return this.nestMailerService.forgetPasswordRequest({ to: userInfo.email, context: {generatedPassword} })
    }
}

