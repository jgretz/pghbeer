import {Dependencies} from '@nestjs/common';
import {QueryHandler} from '@nestjs/cqrs';
import {FindUserByWebUserId} from './findUserByWebuserId';
import {DATABASE} from '../../../constants';

@QueryHandler(FindUserByWebUserId)
@Dependencies(DATABASE)
export class FindUserByWebUserIdHandler {
  constructor(database) {
    this.database = database;
  }

  async execute({webuserid}) {
    return await this.database.users.find({webuserid});
  }
}
