

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as text from '../constants/en';



@Injectable()
export class CustomerAuthGuard extends AuthGuard('jwt') {


    handleRequest(err, user) {

        if (err || !user) {
            throw err || new UnauthorizedException( text.AUTHORIZATION_ERROR );
        }
        return this.isCustomer(user);
    }


    private isCustomer = (user) => {

        if (user.role === 'customer') {
            return user;
        }
        throw new UnauthorizedException(text.AUTHORIZATION_ERROR);
    }
}
