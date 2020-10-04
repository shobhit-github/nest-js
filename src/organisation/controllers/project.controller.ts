import {
    Body, Controller, HttpException, HttpStatus, Post, Res, Put, Param, UseInterceptors, UploadedFiles, Get, UseGuards, Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiConsumes, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import * as fromDto from '../dto';
import { Response } from 'express';

import * as text from '../constants/en';
import * as swaggerDoc from '../constants/swagger';
import * as fileOperations from '../helpers/fileUpload.helper';

import { FilesInterceptor } from '@nestjs/platform-express';
import { ProjectService } from '../services/project.service';
import { IProject } from '../interfaces/project.interface';
import { PermissionGuard, Permissions, JwtAuthGuard } from 'src/auth/guard/permission.guard';
import { UserType } from '../../auth/interfaces/authUtils';
import {PaginateResult} from 'mongoose';
import * as fromAdminDto from '../../admin/dto';




@ApiTags('Organisation')
@Controller('project')
export class ProjectController {


    constructor(private readonly projectService: ProjectService) {
    }


    // create an organisation project
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ORGANISATION)
    @UseInterceptors(FilesInterceptor('projectPictures', 35, {storage: fileOperations.projectPictureDiskStorage, fileFilter: fileOperations.projectPictureFileFilter}))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ required: true, type: fromDto.CreateOrganisationProjectDto })
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: swaggerDoc.CreateProject.summary })
    @ApiResponse({ status: 200 })
    @Post('create/:id')
    public async createOrganisationProject(@Body() projectDto: fromDto.CreateOrganisationProjectDto, @Res() response: Response, @Param() requestParameter: {id: string}, @UploadedFiles() files: any[]): Promise<any> {

        try {

            const projectPictures: string[] = files.map( file => file.path);
            const {projectName, description, targetBudget} = projectDto;

            const projectObject: IProject = (await this.projectService.addProject({projectName, description, targetBudget, projectPictures, organisation: requestParameter.id}));


            return response.status(HttpStatus.CREATED)
                .jsonp( { status: true,message: text.PROJECT_CREATED_SUCCESS, response: projectObject} );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.ORGANISATION_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // get list of project based for particular organisation
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(UserType.ORGANISATION)
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: swaggerDoc.ListProject.summary })
    @ApiResponse({ status: 200 })
    @ApiQuery({ name: 'query', type: Object })
    @Get('listProject/:id')
    public async listProject(@Query() reqQuery: any, @Res() response: Response, @Param() requestParameter: {id: string}): Promise<any> {

        try {

            const listOfOrganisationProjects: PaginateResult<IProject> = (await this.projectService.getAllProjects({ organisation: requestParameter.id}, reqQuery));

            return response.status(HttpStatus.CREATED)
                .jsonp( { status: true,message: text.PROJECT_LIST_SUCCESS, response: listOfOrganisationProjects} );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.PROJECT_LIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // get project detail
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiParam({ required: true, name: 'id' })
    @ApiOperation({ summary: swaggerDoc.ProjectDetail.summary })
    @ApiResponse({ status: 200 })
    @Get('detail/:id')
    public async getProject(@Res() response: Response, @Param() requestParameter: {id: string}): Promise<any> {

        try {

            const projectDetail: IProject = (await this.projectService.getSingleProjectById(requestParameter.id));

            return response.status(HttpStatus.CREATED)
                .jsonp( { status: true,message: text.PROJECT_DETAIL_SUCCESS, response: projectDetail} );

        } catch (e) {
            this.handleErrorLogs(e);
            throw new HttpException(text.PROJECT_DETAIL_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    private handleErrorLogs = (error: any): void => console.log(error);
}
