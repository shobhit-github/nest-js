import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { PaginateModel} from "mongoose";
import * as fromDto from "../dto";
import { Project } from '../../_sharedCollections/dbSchemas/project.schema';
import { IProject } from '../interfaces/project.interface';



@Injectable()
export class ProjectService {


    constructor(@InjectModel(Project.name) private readonly projectModel: PaginateModel<IProject>) {
    }


    // post a new project
    public addProject = async (createProjectDTO: fromDto.CreateProjectDto): Promise<IProject> =>
        (await new this.projectModel(createProjectDTO)).save();


    // Edit project details
    public updateProjectById = async (projectID: string, updateProject: any): Promise<IProject> =>
        ( await this.projectModel.findByIdAndUpdate(projectID, updateProject, { new: true, projection: {password: 0} }) );



    // do increase or decrease project(s) liked
    public increaseDecreaseLikes = async (ids: string[], like: boolean ): Promise<IProject[]> => {
        return ( await this.projectModel.updateMany({ _id: { $in: ids } }, { $inc: { likes: (like ? 1 : -1) } }).exec() );
    }


    public getAllProjects = async (condition: any): Promise<IProject[]> => ( await this.projectModel.find(condition).exec() );

}
