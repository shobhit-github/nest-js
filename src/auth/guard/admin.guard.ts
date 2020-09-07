

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as text from '../constants/en';


@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {

    handleRequest(err, user) {

        if (err || !user) {
            throw err || new UnauthorizedException(text.AUTHORIZATION_ERROR);
        }
        return this.isAdmin(user);
    }


    private isAdmin = (user) => {

        if (user.role === 'admin') {
            return user;
        }
        throw new UnauthorizedException(text.AUTHORIZATION_ERROR);
    }
}
