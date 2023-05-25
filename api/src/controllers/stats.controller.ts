import {Body, Controller, Post} from '@nestjs/common';
import {UpdateStatsDto} from 'src/dto';
import {StatsService} from 'src/services/stats.service';

@Controller('stats')
export class StatsController {
  constructor(private service: StatsService) {}

  @Post()
  async updateStats(@Body() {beerId, eventId, userId, tasted}: UpdateStatsDto) {
    await this.service.updateStats(beerId, eventId, userId, tasted);
  }
}
