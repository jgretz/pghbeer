import {Controller} from '@nestjs/common';
import {ReadController} from './read.controller';
import {events} from '@prisma/client';
import {EventsService} from '../services';

@Controller('events')
export class EventsController extends ReadController<events> {
  constructor(service: EventsService) {
    super(service);
  }
}
