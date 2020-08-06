
import { OnGatewayConnection, OnGatewayInit, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { AppService } from './app.service';

const WEB_SOCKET_CONNECTION_SUCCESS: string = 'Web Socket connection has been established successfully';


@WebSocketGateway()
export class AppSocket implements OnGatewayConnection, OnGatewayInit {

    @WebSocketServer() private readonly server: Server;
    private readonly logger: Logger = new Logger('ApplicationSocket');


    constructor(private readonly applicationService: AppService) {
    }


    afterInit(): void {
        this.logger.log('Application Socket Initialized');
    }


    handleConnection(): void {
        console.log('-go--')
        this.server.emit('application-connection', {message: WEB_SOCKET_CONNECTION_SUCCESS});
    }



}
