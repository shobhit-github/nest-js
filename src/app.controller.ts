import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from "./app.service";
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

@ApiTags('Application')
@Controller()
export class AppController {


    constructor(private readonly appService: AppService) {
    }



    @ApiExcludeEndpoint(true)
    @Get('_uploads/:folder/:fileName')
    async serveStaticAsset(@Param() requestParameter: {folder: string, fileName: string}, @Res() response): Promise<any> {
        console.log(process.cwd())
        return response.sendFile(requestParameter.fileName, { root: process.cwd() + '/_uploads/' + requestParameter.folder});
    }


}
