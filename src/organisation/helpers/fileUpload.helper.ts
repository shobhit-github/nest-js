import {FilterFileOptions} from '../interfaces/organisation.interface';
import {diskStorage} from 'multer'
import { HttpException, HttpStatus } from '@nestjs/common';
import { extname } from  'path';


import * as text from '../constants/en';


const LOGO_PATH: string = '_uploads/logo';
const TIMELINE_PIC_PATH: string = '_uploads/timelinePictures';
const randomFileString = (arrayLength: number): string => Array(arrayLength).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');





export const logoFileFilter = (req: any, file: FilterFileOptions, callback: (error: (HttpException | null), acceptFile: boolean) => void) => {

    if ( !file.originalname.match(/\.(jpg|jpeg|png|gif)$/) ) {
        return callback( new HttpException(text.FILE_ACCEPT_IMAGE, HttpStatus.BAD_REQUEST), false);
    }
    callback(null, true);
};


export const logoDiskStorage = diskStorage({ destination: LOGO_PATH,
    filename(req: any, file: Express.Multer.File, callback: (error: (HttpException | null), filename: string) => void): void {
        callback(null, randomFileString(32) + extname(file.originalname))
    }
});



export const pictureFileFilter = (req: any, file: FilterFileOptions, callback: (error: (HttpException | null), acceptFile: boolean) => void) => {

    if ( !file.originalname.match(/\.(jpg|jpeg|png|gif)$/) ) {
        return callback( new HttpException(`${text.FILE_ACCEPT_IMAGE} (fileName: ${file.originalname})`, HttpStatus.BAD_REQUEST), false);
    }
    callback(null, true);
};


export const pictureDiskStorage = diskStorage({ destination: TIMELINE_PIC_PATH,
    filename(req: any, file: Express.Multer.File, callback: (error: (HttpException | null), filename: string) => void): void {
        callback(null, randomFileString(32) + extname(file.originalname))
    }
});


