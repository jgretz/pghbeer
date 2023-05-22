import {Controller} from '@nestjs/common';
import {ReadController} from './read.controller';
import {breweries} from '@prisma/client';
import {BreweriesService} from '../services';

@Controller('breweries')
export class BreweriesController extends ReadController<breweries> {
  constructor(service: BreweriesService) {
    super(service);
  }
}
