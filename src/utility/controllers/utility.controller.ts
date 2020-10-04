import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UtilityService } from '../services/utility.service';
import { Response } from 'express';
import {PaginateResult} from "mongoose"
import * as text from '../constants/en';
import * as swaggerDoc from '../constants/swagger';
import * as _ from 'lodash';
import * as fromDto from '../dto';
import { ICategory } from '../interfaces/utilities.inteface';
import { IContent, IFaq } from '../interfaces/content.interface';
import { IUserRequest } from '../interfaces/user-request.interface';


@ApiTags('Utilities')
@Controller('utility')
export class UtilityController {


    constructor(private readonly utilitiesService: UtilityService) {
    }


    // get list of interests
    @ApiOperation({summary: swaggerDoc.CategoryList.summary })
    @ApiResponse({ status: 200 })
    @Get('listInterest')
    public async getInterests(@Res() response: Response): Promise<any> {

        try {

            const categoryArray: ICategory[] = await this.utilitiesService.getCategoryList({});

            if (categoryArray.length < 1) {
                return response.status(HttpStatus.OK).jsonp({status: false, message: text.NO_INTEREST_DATA_FOUND, response: []});
            }

            return response.status(HttpStatus.OK).jsonp({status: true, message: text.INTERESTS_LIST_RETRIEVE_SUCCESS, response: categoryArray});

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.INTERESTS_LIST_RETRIEVE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }


    // get list of interests
    @ApiOperation({summary: swaggerDoc.AppContent.summary })
    @ApiResponse({ status: 200 })
    @ApiParam({name: 'for', required: true, enum: ['all', 'privacy_policy', 'terms_condition', 'about']})
    @Get('cms/:for')
    public async getContent(@Res() response: Response, @Param() reqParam: {for: string}): Promise<any> {

        const projectionFields: any = 'all' === reqParam.for ? {} : { [_.camelCase(reqParam.for)]: 1 };

        try {

            const contentObject: IContent = await this.utilitiesService.getApplicationContent(projectionFields);

            if ( ! contentObject ) {
                return response.status(HttpStatus.OK).jsonp({status: false, message: text.NO_CONTENT_FOUND, response: null});
            }

            return response.status(HttpStatus.OK).jsonp({status: true, message: text.CONTENT_RETRIEVED_SUCCESS, response: contentObject});

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.CONTENT_RETRIEVED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }



    // get list of faqs
    @ApiOperation({summary: swaggerDoc.FaqContent.summary })
    @ApiResponse({ status: 200 })
    @ApiParam({name: 'for', required: true, enum: ['all', 'organisation', 'customer']})
    @ApiQuery({name: 'query', type: Object})
    @Get('faqs/:for')
    public async getFaqs(@Res() response: Response, @Param() reqParam: {for: string}, @Query() reqQuery: any): Promise<any> {

        const conditionalQuery: any = 'all' === reqParam.for ? {} : { questionFor: { $in: [ reqParam.for.toUpperCase(), 'ALL' ] } };

        try {
            const faqList: PaginateResult<IFaq> = await this.utilitiesService.getApplicationFaqs(conditionalQuery, reqQuery);

            if ( ! faqList.docs.length ) {
                return response.status(HttpStatus.OK).jsonp({status: false, message: text.NO_FAQ_FOUND, response: faqList});
            }

            return response.status(HttpStatus.OK).jsonp({status: true, message: text.FAQ_RETRIEVED_SUCCESS, response: faqList});

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.FAQ_RETRIEVED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }



    // get list of faqs
    @ApiOperation({summary: swaggerDoc.UserRequest.summary })
    @ApiResponse({ status: 200 })
    @ApiBody({type: fromDto.UserRequestDto, required: true})
    @Post('submitRequest')
    public async submitRequest(@Res() response: Response, @Body() reqBody: fromDto.UserRequestDto): Promise<any> {

        try {

            const requestObject: IUserRequest = await this.utilitiesService.submitUserRequest(reqBody);

            if ( ! requestObject ) {
                return response.status(HttpStatus.BAD_REQUEST).jsonp({status: false, message: text.REQUEST_SUBMIT_FAILED, response: null});
            }

            return response.status(HttpStatus.CREATED).jsonp({status: true, message: text.REQUEST_SUBMIT_SUCCESS, response: requestObject});

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.REQUEST_SUBMIT_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }


    private handleErrorLogs = (error: any): void => console.log(error)
}
