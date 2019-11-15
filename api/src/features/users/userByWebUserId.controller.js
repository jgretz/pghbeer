import {Bind, Param, Get, Dependencies, Controller} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {FindUserByWebUserId} from './findUserByWebUserId';

@Controller('userByWebUserId')
@Dependencies(QueryBus)
export class UserByWebUserIdController {
  constructor(queryBus) {
    this.queryBus = queryBus;
  }

  @Get(':webuserid')
  @Bind(Param('webuserid'))
  async findOne(webuserid) {
    return this.queryBus.execute(new FindUserByWebUserId(webuserid));
  }
}
