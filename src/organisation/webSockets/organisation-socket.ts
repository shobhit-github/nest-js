
import {
    MessageBody,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { OrganisationService } from '../services/organisation.service';
import { Server, Socket } from 'socket.io';

import * as text from '../constants/en';
import {IWebSocketConnection} from '../interfaces/socket.interface';
import { IOrganisation } from '../interfaces/organisation.interface';


@WebSocketGateway()
export class OrganisationSocket implements OnGatewayDisconnect {

    @WebSocketServer() private readonly server: Server;
    private clientConnections: Map<string, string> = new Map();


    constructor(private readonly organisationService: OrganisationService) {
    }


    handleDisconnect(client: Socket): void {

        this.clientConnections.delete(client.id)
    }


    @SubscribeMessage('set-new-connection')
    public setConnectionForUser(@MessageBody() connectionObject: IWebSocketConnection, client: Socket): void {

        this.clientConnections[client.id] = connectionObject;
        client.server.emit('connection-set-success', {message: text.WEB_SOCKET_USER_CONNECTION_SUCCESS + connectionObject._id})
    }


    public transmitLoginStatus(organisation: IOrganisation, status: boolean): void {

        this.server.emit('login-evt', {organisation, status});
    }


}
