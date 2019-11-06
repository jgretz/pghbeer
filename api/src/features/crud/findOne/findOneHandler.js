import {Dependencies} from '@nestjs/common';
import {QueryHandler} from '@nestjs/cqrs';
import {FindOne} from './findOne';
import {DATABASE} from '../../../constants';

@QueryHandler(FindOne)
@Dependencies(DATABASE)
export class FindOneHandler {
  constructor(database) {
    this.database = database;
  }

  async execute({tableName, id}) {
    return await this.database[tableName].findOne(id);
  }
}
