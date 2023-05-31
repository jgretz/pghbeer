import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {UpdateStatsDto} from 'src/dto';
import {StatsService} from 'src/services/stats.service';

@Controller('stats')
export class StatsController {
  constructor(private service: StatsService) {}

  @Get()
  async findAll(@Query('event_id') event_id: string) {
    return this.service.findAll(parseInt(event_id, 10));
  }

  @Post()
  async updateStats(@Body() {beerId, eventId, userId, tasted}: UpdateStatsDto) {
    await this.service.updateStats(beerId, eventId, userId, tasted);
  }
}
