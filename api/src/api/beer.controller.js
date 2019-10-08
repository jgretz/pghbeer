import {Controller, Dependencies} from '@nestjs/common';
import {BeerService} from '../services';
import CrudController from './crud.controller';

@Controller('beer')
@Dependencies(BeerService)
export default class BeerController extends CrudController {
  constructor(beerService) {
    super(beerService);
  }
}
