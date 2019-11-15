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
    return await this.database.stats
      .join({
        users: {
          type: 'INNER',
          on: {id: 'user_id'},
        },
      })
      .find({
        'users.webuserid': webuserid,
      });
  }
}
