

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as text from '../constants/en';



@Injectable()
export class OrganisationAuthGuard extends AuthGuard('jwt') {


    handleRequest(err, user) {

        if (err || !user) {
            throw err || new UnauthorizedException( text.AUTHORIZATION_ERROR );
        }
        return this.isOrganisation(user);
    }



    private isOrganisation = (user) => {

        if (user.role === 'organisation') {
            return user;
        }
        throw new UnauthorizedException(text.AUTHORIZATION_ERROR);
    }
}
