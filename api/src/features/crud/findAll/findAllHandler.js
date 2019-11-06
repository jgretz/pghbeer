import {Dependencies} from '@nestjs/common';
import {QueryHandler} from '@nestjs/cqrs';
import {FindAll} from './findAll';
import {DATABASE} from '../../../constants';

@QueryHandler(FindAll)
@Dependencies(DATABASE)
export class FindAllHandler {
  constructor(database) {
    this.database = database;
  }

  async execute({tableName}) {
    return await this.database[tableName].find();
  }
}
