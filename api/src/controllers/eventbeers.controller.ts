import {Controller} from '@nestjs/common';
import {ReadController} from './read.controller';
import {eventbeerlist} from '@prisma/client';
import {EventBeersService} from '../services';

@Controller('eventbeers')
export class EventBeersController extends ReadController<eventbeerlist> {
  constructor(service: EventBeersService) {
    super(service);
  }
}
