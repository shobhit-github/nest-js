import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { PaginateModel, PaginateResult, Model } from "mongoose";
import * as fromDto from "../dto";
import { Project } from '../../_sharedCollections/dbSchemas/project.schema';
import { IProject } from '../interfaces/project.interface';
import { IOrganisation } from '../interfaces/organisation.interface';
import { Organisation } from '../../_sharedCollections/dbSchemas/organisation.schema';
import * as fromAdminDto from '../../admin/dto';



@Injectable()
export class ProjectService implements OnModuleInit {

    private projectCollectionName: string;
    private organisationCollectionName: string;


    constructor(@InjectModel(Project.name) private readonly projectModel: PaginateModel<IProject> | Model<IProject> | any,
                @InjectModel(Organisation.name) private readonly organisationModel: PaginateModel<IOrganisation> | any | Model<IOrganisation>) {
    }


    onModuleInit(): void {

        this.projectCollectionName = this.projectModel.collection.collectionName;
        this.organisationCollectionName = this.organisationModel.collection.collectionName;
    }


    private aggregateInterestBasedProject = (ids: string[]) => {
        return this.projectModel.aggregate()
            .lookup( { from: this.organisationCollectionName, localField: 'organisation', foreignField: '_id', as: 'organisation' } ).match ( { 'organisation.interests': { $in: ids } } ).project({organisation: 0})
    }


    private aggregateSearchProject = (condition: any[]) => {
        return this.projectModel.aggregate()
            .lookup( { from: this.organisationCollectionName, localField: 'organisation', foreignField: '_id', as: 'organisation' } ) .match ({  $or: condition }).project({organisation: 0})
    }

    // post a new project
    public addProject = async (createProjectDTO: fromDto.SaveProjectDto): Promise<IProject> => (await new this.projectModel(createProjectDTO)).save();


    // get projects by query
    public getProjects = async (condition: any): Promise<IProject> => (await this.projectModel.find(condition));


    // get projects by query
    public getAllProjects = async (conditions: any, paging: fromAdminDto.DataListDto): Promise<PaginateResult<IProject>> => (
        await this.projectModel.paginate(conditions, { ...paging })
    );


    // update multiple records
    public updateManyProjects = async (listOfIds: string[], payload): Promise<IOrganisation[]> => {
        return this.projectModel.updateMany({ _id: { $in: listOfIds } }, { $set: { ...payload } });
    };


    // delete multiple records
    public deleteMultipleProjects = async (listOfIds: string[]): Promise<any> => {
        return this.projectModel.deleteMany({ _id: { $in: listOfIds } });
    };


    // Edit project details
    public updateProjectById = async (projectID: string, updateProject: any): Promise<IProject> => (
        await this.projectModel.findByIdAndUpdate(projectID, updateProject, { new: true, projection: {password: 0} })
    );


    // do increase or decrease project(s) liked
    public increaseDecreaseLikes = async (ids: string[], like: boolean ): Promise<IProject[]> => {
        return ( await this.projectModel.updateMany({ _id: { $in: ids } }, { $inc: { likes: (like ? 1 : -1) } }).exec() );
    }


    // projects based on interests
    public getProjectsByInterest = async (ids: string[], paging: any): Promise<PaginateResult<IProject>> => (
            await this.projectModel.aggregatePaginate( this.aggregateInterestBasedProject(ids), {...paging} )
    );


    // projects based on interests
    public searchProject = async (condition: any[], paging: any): Promise<PaginateResult<IProject>> => (
            await this.projectModel.aggregatePaginate( this.aggregateSearchProject(condition), {...paging} )
    );


    public getSingleProjectById = async (id: string): Promise<IProject> => (
        await this.projectModel.findById( id ).populate({ path: 'organisation', populate: { path: 'interests'} })
    )


    public getMultipleProjectsByIds = async (ids: string[]): Promise<IProject[]> => (await this.projectModel.find({ _id: { $in: ids } }));


}

