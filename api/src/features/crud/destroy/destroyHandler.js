import {Dependencies} from '@nestjs/common';
import {CommandHandler} from '@nestjs/cqrs';
import {Destroy} from './destroy';
import {DATABASE} from '../../../constants';

@CommandHandler(Destroy)
@Dependencies(DATABASE)
export class DestroyHandler {
  constructor(database) {
    this.database = database;
  }

  async execute({tableName, id}) {
    return await this.database[tableName].destroy(id);
  }
}
