
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import * as text from '../constants/en';
import {IWebSocketConnection} from '../interfaces/socket.interface';
import { AdminService } from '../services/admin.service';


@WebSocketGateway()
export class AdminSocket implements OnGatewayDisconnect {

    @WebSocketServer() private readonly server: Server;
    private clientConnections: Map<string, string> = new Map();


    constructor(private readonly adminService: AdminService) {
    }


    handleDisconnect(client: Socket): void {

        this.clientConnections.delete(client.id)
    }


    @SubscribeMessage('set-admin-connection')
    public setConnectionForUser(@MessageBody() connectionObject: IWebSocketConnection, @ConnectedSocket() client: Socket): void {
        this.clientConnections[client.id] = connectionObject;
        client.server.emit('connection-set-success', {message: text.WEB_SOCKET_USER_CONNECTION_SUCCESS + connectionObject._id})
    }



}
