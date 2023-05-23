import {Controller, Get, Query} from '@nestjs/common';
import {DataForEventService} from '../services';

@Controller('dataforevent')
export class DataEventForEventController {
  constructor(private service: DataForEventService) {}

  @Get()
  async findAll(@Query('event_id') event_id: string) {
    return this.service.findAll(parseInt(event_id, 10));
  }
}
