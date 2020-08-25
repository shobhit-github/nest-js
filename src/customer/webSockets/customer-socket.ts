
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { CustomerService } from '../services/customer.service';
import { Server, Socket } from 'socket.io';

import * as text from '../constants/en';
import {IWebSocketConnection} from '../interfaces/socket.interface';
import { ICustomer } from '../interfaces/customer.interface';


@WebSocketGateway()
export class CustomerSocket implements OnGatewayDisconnect {

    @WebSocketServer() private readonly server: Server;
    public clientConnections: Map<string, string> = new Map();


    constructor(private readonly customerService: CustomerService) {
    }


    handleDisconnect(client: Socket): void {

        this.clientConnections.delete(client.id)
    }


    @SubscribeMessage('set-new-connection')
    public setConnectionForUser(@MessageBody() connectionObject: IWebSocketConnection, @ConnectedSocket() client: Socket): void {

        this.clientConnections[client.id] = connectionObject;
        client.server.emit('connection-set-success', {message: text.WEB_SOCKET_USER_CONNECTION_SUCCESS + connectionObject._id})
    }


    public transmitVerificationStatus(customer: ICustomer, status: boolean): void {

        this.server.emit('verification-evt', {customer, status});
    }


    public transmitLoginStatus(customer: ICustomer, status: boolean): void {

        this.server.emit('login-evt', {customer, status});
    }


    public newAccountCreated(customer: ICustomer): void {

        this.server.emit('new-customer-evt', {customer});
    }


}
