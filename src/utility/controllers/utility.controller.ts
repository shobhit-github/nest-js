import { Controller, Get, HttpException, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UtilityService } from '../services/utility.service';
import { Response } from 'express';
import * as text from '../constants/en';
import { ICategory } from '../interfaces/utilities.inteface';


@ApiTags('Utilities')
@Controller('utility')
export class UtilityController {


    constructor(private readonly utilitiesService: UtilityService) {
    }


    // get list of interests
    @ApiOperation({summary: 'This api help to retrieve the all interests categories that will use by the customer and organisation'})
    @ApiResponse({ status: 200 })
    @Get('listInterest')
    public async getInterests(@Res() response: Response): Promise<any> {

        try {

            const categoryArray: ICategory[] = await this.utilitiesService.getCategoryList({});

            if (categoryArray.length < 1) {
                return response.status(HttpStatus.NO_CONTENT).jsonp({status: false, message: text.NO_INTEREST_DATA_FOUND, response: []});
            }

            return response.status(HttpStatus.OK).jsonp({status: true, message: text.INTERESTS_LIST_RETRIEVE_SUCCESS, response: categoryArray});

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERESTS_LIST_RETRIEVE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }


    private handleErrorLogs = (error: any): void => console.log(error)
}
