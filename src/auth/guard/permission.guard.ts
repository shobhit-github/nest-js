import { SetMetadata, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import * as text from '../constants/en';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';


export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}


@Injectable()
export class PermissionGuard implements CanActivate {


    constructor(private readonly reflector: Reflector) {
    }


    canActivate( context: ExecutionContext ): boolean | Observable<boolean> | Promise<boolean> {

        const routePermissions: string[] = this.reflector.get<string[]>(
            'permissions', context.getHandler(),
        );

        const userPermissions = context.getArgs()[0].user.role;

        if ( ! routePermissions ) {
            return true;
        }

        const hasPermission = (): boolean => routePermissions.includes(userPermissions);

        return PermissionGuard.handleGuardResponse( hasPermission() );
    }


    private static handleGuardResponse(guardResponse: boolean): boolean | Observable<boolean> | Promise<boolean>  {

        if ( ! guardResponse ) {
            throw ( new UnauthorizedException( text.AUTHORIZATION_ERROR ) )
        }

        return ( guardResponse );
    }
}
