import {Bind, Param, Get, Dependencies, Controller} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {FindStatsByWebUserId} from './findStatsByWebUserId';

@Controller('statsForUser')
@Dependencies(QueryBus)
export class StatsForUserController {
  constructor(queryBus) {
    this.queryBus = queryBus;
  }

  @Get(':webuserid')
  @Bind(Param('webuserid'))
  async findOne(webuserid) {
    return this.queryBus.execute(new FindStatsByWebUserId(webuserid));
  }
}
