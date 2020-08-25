import {
    Body, Controller, HttpException, HttpStatus, Post, Res, Put, Param, UseInterceptors, UploadedFiles, Get } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import * as fromDto from '../dto';
import { Response } from 'express';

import * as text from '../constants/en';
import * as fileOperations from '../helpers/fileUpload.helper';

import { FilesInterceptor } from '@nestjs/platform-express';
import { ProjectService } from '../services/project.service';
import { IProject } from '../interfaces/project.interface';


@ApiTags('Organisation')
@Controller('project')
export class ProjectController {


    constructor(private readonly projectService: ProjectService) {
    }



    // add an project for an organisation
    @ApiBearerAuth()
    @ApiBody({ required: true, type: fromDto.CreateProjectDto })
    @ApiOperation({ summary: 'Create a new project to get new donation for an organisation' })
    @ApiResponse({ status: 200 })
    @ApiParam({ required: true, name: 'id' })
    @Post('create/:id')
    public async createProject(@Body() projectDto: fromDto.CreateProjectDto | any, @Res() response: Response, @Param() requestParameter: {id: string}): Promise<any> {

        try {

            const projectObject: IProject = (await this.projectService.addProject({...projectDto, organisation: requestParameter.id}));

            return response.status(HttpStatus.CREATED)
                .jsonp( { status: true,message: text.PROJECT_CREATED_SUCCESS, response: projectObject} );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.PROJECT_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // upload project timeline pictures
    @ApiBearerAuth()
    @UseInterceptors(FilesInterceptor('pictures', 35, {storage: fileOperations.projectPictureDiskStorage, fileFilter: fileOperations.projectPictureFileFilter}))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ required: true, type: fromDto.UpdateProjectPictureDto })
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: 'This api will help to upload project timeline pictures of the organisation profile' })
    @ApiResponse({ status: 200 })
    @Put('uploadProjectPictures/:id')
    public async uploadProjectPictures(@Res() response: Response, @Param() requestParameter: {id: string}, @UploadedFiles() files: any[]): Promise<any> {

        try {

            const projectPictures: string[] = files.map( file => file.path);

            const updateProjectObject: IProject = await this.projectService.updateProjectById(requestParameter.id, {projectPictures})

            console.log(files)

            return response.status(HttpStatus.OK)
                .jsonp(
                    { status: true, message: text.PROJECT_PIC_UPLOADED_SUCCESS, response: updateProjectObject },
                );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.PROJECT_PIC_UPLOADED_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    private handleErrorLogs = (error: any): void => console.log(error);
}
