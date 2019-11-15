import moment from 'moment';
import {Dependencies} from '@nestjs/common';
import {CommandHandler} from '@nestjs/cqrs';
import {Update} from './update';
import {DATABASE} from '../../../constants';

@CommandHandler(Update)
@Dependencies(DATABASE)
export class UpdateHandler {
  constructor(database) {
    this.database = database;
  }

  async execute({tableName, id, obj}) {
    return await this.database[tableName].update(
      {id},
      {
        ...obj,

        update_date: moment.utc().toDate(),
      },
    );
  }
}
