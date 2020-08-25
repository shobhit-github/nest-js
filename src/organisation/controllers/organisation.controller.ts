import {
    Body, Controller, HttpException, HttpStatus, Post, Res, Put, Param, UseInterceptors, UploadedFile, UploadedFiles, Get } from '@nestjs/common';
import { OrganisationService } from '../services/organisation.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import * as fromDto from '../dto';
import { Response } from 'express';
import * as fileSystem from 'fs';

import * as _ from 'lodash';
import * as text from '../constants/en';
import * as fileOperations from '../helpers/fileUpload.helper';

import { IOrganisation } from '../interfaces/organisation.interface';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';


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


            return response.status(HttpStatus.CREATED)
                .jsonp( { status: true,message: text.ORGANISATION_CREATED_SUCCESS, response: _.omit(organisationObject, 'password')} );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // complete organisation profile
    @UseInterceptors(FilesInterceptor('pictures', 20, {storage: fileOperations.pictureDiskStorage, fileFilter: fileOperations.pictureFileFilter}))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ required: true, type: fromDto.CreateOrganisationProfileDto })
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: 'This api will help to complete the organisation profile' })
    @ApiResponse({ status: 200 })
    @Put('updateProfile/:id')
    public async completeOrganisationProfile(@Body() organisationDto: fromDto.CreateOrganisationProfileDto, @Res() response: Response, @Param() requestParameter: {id: string}, @UploadedFiles() files: any[]): Promise<any> {

        try {

            const pictures: string[] = files.map( file => file.path);
            const {description, organisationName} = organisationDto;
            const interests: string[] = organisationDto.interests.split(',');

            const updateOrganisationProfile: IOrganisation = await this.organisationService.updateOrganisationById(requestParameter.id, {pictures, interests, description, organisationName })

            console.log(files)

            return response.status(HttpStatus.CREATED)
                .jsonp(
                    { status: true, message: text.ORGANISATION_CREATED_SUCCESS, response: updateOrganisationProfile },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // upload organisation logo
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: 'This API will provide the facility to update organisation logo' })
    @ApiResponse({ status: 200 })
    @UseInterceptors(FileInterceptor('logo', {storage: fileOperations.logoDiskStorage, fileFilter: fileOperations.logoFileFilter}))
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: fromDto.UpdateOrganisationLogoDto, required: true})
    @Put('updateLogo/:id')
    public async updateLogo(@UploadedFile() file: any, @Res() response: Response, @Param() requestParameter: { id: string }): Promise<any> {

        try {

            const organisationProfile = await this.organisationService.getOrganisationById(requestParameter.id);

            if ( organisationProfile.organisationLogo ) {
                fileSystem.unlinkSync(organisationProfile.organisationLogo);
            }

            const updateOrganisationLogo = await this.organisationService.updateOrganisationById(requestParameter.id, {organisationLogo: file.path})

            return response.status(HttpStatus.CREATED)
                .jsonp(
                    { status: true, message: text.ORGANISATION_CREATED_SUCCESS, response: updateOrganisationLogo },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }



    private handleErrorLogs = (error: any): void => console.log(error);
}
