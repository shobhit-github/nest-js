import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { jwtConstants } from '../auth.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {


    constructor() {
        super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: jwtConstants.JWT_SECRET });
    }

    public async validate(payload: any) {
        return payload;
    }
}
