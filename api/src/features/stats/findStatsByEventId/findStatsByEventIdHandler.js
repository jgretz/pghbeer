import {Dependencies} from '@nestjs/common';
import {QueryHandler} from '@nestjs/cqrs';
import {FindStatsByEventId} from './findStatsByEventId';
import {DATABASE} from '../../../constants';

@QueryHandler(FindStatsByEventId)
@Dependencies(DATABASE)
export class FindStatsByEventIdHandler {
  constructor(database) {
    this.database = database;
  }

  async execute({event_id}) {
    return await this.database.stats.find({event_id});
  }
}
