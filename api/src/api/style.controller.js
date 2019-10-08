import {Controller, Dependencies} from '@nestjs/common';
import {StyleService} from '../services';
import CrudController from './crud.controller';

@Controller('style')
@Dependencies(StyleService)
export default class StyleController extends CrudController {
  constructor(styleService) {
    super(styleService);
  }
}
