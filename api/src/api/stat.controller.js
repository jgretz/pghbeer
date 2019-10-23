import {Controller, Dependencies} from '@nestjs/common';
import {StatService} from '../services';
import CrudController from './crud.controller';

@Controller('stats')
@Dependencies(StatService)
export default class StatController extends CrudController {
  constructor(statService) {
    super(statService);
  }
}
