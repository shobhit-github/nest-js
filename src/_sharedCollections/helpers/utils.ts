import * as _ from 'lodash';



export const generateRandomString = (totalLetters: number): string => {

    return _.times(totalLetters, () => _.random(35).toString(36)).join('');
};



export const generateRandomNumber = (min: number, max: number): number => Math.floor(min + Math.random() * max);
