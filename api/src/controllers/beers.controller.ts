import { Controller } from '@nestjs/common';
import { ReadController } from './read.controller';
import { beers } from '@prisma/client';
import { BeersService } from 'src/services';

@Controller('beers')
export class BeersController extends ReadController<beers> {
  constructor(service: BeersService) {
    super(service);
  }
}
