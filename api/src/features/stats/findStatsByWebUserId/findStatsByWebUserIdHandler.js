import {Dependencies} from '@nestjs/common';
import {QueryHandler} from '@nestjs/cqrs';
import {FindStatsByWebUserId} from './findStatsByWebUserId';
import {DATABASE} from '../../../constants';

@QueryHandler(FindStatsByWebUserId)
@Dependencies(DATABASE)
export class FindStatsByWebUserIdHandler {
  constructor(database) {
    this.database = database;
  }

  async execute({webuserid}) {
    return await this.database.stats.where(
      'user_id in (SELECT id FROM users WHERE webuserid = ${webuserid})',
      {webuserid},
    );
  }
}
