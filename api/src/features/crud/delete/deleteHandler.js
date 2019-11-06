import {Dependencies} from '@nestjs/common';
import {CommandHandler} from '@nestjs/cqrs';
import {Delete} from './delete';
import {DATABASE} from '../../../constants';

@CommandHandler(Delete)
@Dependencies(DATABASE)
export class DeleteHandler {
  constructor(database) {
    this.database = database;
  }

  async execute({tableName, obj}) {
    return await this.database[tableName].destoy(obj);
  }
}
