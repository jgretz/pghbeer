import {Dependencies} from '@nestjs/common';
import {CommandHandler} from '@nestjs/cqrs';
import {Create} from './create';
import {DATABASE} from '../../../constants';

@CommandHandler(Create)
@Dependencies(DATABASE)
export class CreateHandler {
  constructor(database) {
    this.database = database;
  }

  async execute({tableName, obj}) {
    return await this.database[tableName].insert(obj);
  }
}
