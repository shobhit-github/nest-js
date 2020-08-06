import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    Res,
    Put,
    Param,
    UseInterceptors,
    UploadedFile, UploadedFiles, Get,
} from '@nestjs/common';
import { OrganisationService } from '../services/organisation.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import * as fromDto from '../dto';
import { Response } from 'express';

import * as _ from 'lodash';
import * as text from '../constants/en';

import { IOrganisation } from '../interfaces/organisation.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiImplicitFile } from '@nestjs/swagger/dist/decorators/api-implicit-file.decorator';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';


@ApiTags('Organisation')
@Controller('organisation')
export class OrganisationController {


    constructor(private readonly organisationService: OrganisationService) {
    }


    // add an organisation
    @ApiBody({ required: true, type: fromDto.CreateOrganisationDto })
    @ApiOperation({ summary: 'Create a new organisation to get new donations' })
    @ApiResponse({ status: 200 })
    @Post('create')
    public async addNewOrganisation(@Body() organisationDto: fromDto.CreateOrganisationDto, @Res() response: Response): Promise<any> {

        try {

            const isOrganisationExist: boolean = !!(await this.organisationService.getSingleOrganisation({ email: organisationDto.email }));

            if (isOrganisationExist) {

                return response.status(HttpStatus.NOT_ACCEPTABLE)
                    .jsonp(
                        { status: false, message: text.ORGANISATION_ALREADY_EXIST, response: null },
                    );
            }

            const organisationObject: IOrganisation = (await this.organisationService.addOrganisation(organisationDto));


            return response.status(HttpStatus.OK)
                .jsonp(
                    {
                        status: true,
                        message: text.ORGANISATION_CREATED_SUCCESS,
                        response: _.omit(organisationObject, 'password'),
                    },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // complete organisation profile
    @UseInterceptors(FileInterceptor('pictures'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ required: true, type: fromDto.CreateOrganisationProfileDto })
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: 'This api will help to complete the organisation profile' })
    @ApiResponse({ status: 200 })
    @Put('createProfile/:id')
    public async completeOrganisationProfile(@Body() organisationDto: fromDto.CreateOrganisationProfileDto, @Res() response: Response, @Param() requestParameter: {id: string}, @UploadedFiles() files: any): Promise<any> {

        try {

            console.log(organisationDto, files)

            /*const organisationObject: IOrganisation = ( await this.organisationService.getSingleOrganisation({_id: requestParameter.id}) );

            if ( isOrganisationExist ) {

                return response.status(HttpStatus.NOT_ACCEPTABLE)
                    .jsonp(
                        { status: false, message: text.ORGANISATION_ALREADY_EXIST, response: null}
                    )
            }

            const organisationObject: IOrganisation = ( await this.organisationService.addOrganisation( organisationDto ) );

            */
            return response.status(HttpStatus.OK)
                .jsonp(
                    { status: true, message: text.ORGANISATION_CREATED_SUCCESS, response: null },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // complete organisation profile
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: 'This API will provide the facility to update organisation logo' })
    @ApiResponse({ status: 200 })
    @UseInterceptors(FileInterceptor('logo'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: fromDto.UpdateOrganisationLogoDto, required: true})
    @Put('updateLogo/:id')
    public async updateLogo(@UploadedFile() file: fromDto.UpdateOrganisationLogoDto, @Res() response: Response, @Param() requestParameter: { id: string }): Promise<any> {

        try {


            console.log(file);

            return response.status(HttpStatus.OK)
                .jsonp(
                    { status: true, message: text.ORGANISATION_CREATED_SUCCESS, response: null },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }



    // send verification code
    @ApiOperation({summary: 'Resend verification code if the code have not received yet'})
    @ApiResponse({ status: 200 })
    @Get('trySocket')
    public async sampleSocket(@Res() response: Response): Promise<any> {



        try {


        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.VERIFICATION_CODE_RESENT_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    private handleErrorLogs = (error: any): void => console.log(error);
}
