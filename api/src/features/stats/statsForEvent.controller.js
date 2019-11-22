import {Bind, Param, Get, Dependencies, Controller} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {FindStatsByEventId} from './findStatsByEventId';

@Controller('statsForEvent')
@Dependencies(QueryBus)
export class StatsForEventController {
  constructor(queryBus) {
    this.queryBus = queryBus;
  }

  @Get(':event_id')
  @Bind(Param('event_id'))
  async findAll(event_id) {
    return this.queryBus.execute(new FindStatsByEventId(event_id));
  }
}
