import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from "./app.service";

@Controller()
export class AppController {


    constructor(private readonly appService: AppService) {
    }



    @Get('_uploads/:folder/:fileName')
    async serveAvatar(@Param() requestParameter: {folder: string, fileName: string}, @Res() response): Promise<any> {
        response.sendFile(requestParameter.fileName, { root: process.cwd() + '/_uploads/' + requestParameter.folder});
    }
}
