import {Controller, Dependencies} from '@nestjs/common';
import {EventService} from '../services';
import CrudController from './crud.controller';

@Controller('events')
@Dependencies(EventService)
export default class EventController extends CrudController {
  constructor(eventService) {
    super(eventService);
  }
}
