import {Controller, Dependencies} from '@nestjs/common';
import {BreweryService} from '../services';
import CrudController from './crud.controller';

@Controller('breweries')
@Dependencies(BreweryService)
export default class BreweryController extends CrudController {
  constructor(breweryService) {
    super(breweryService);
  }
}
