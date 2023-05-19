import { Controller } from '@nestjs/common';
import { ReadController } from './read.controller';
import { styles } from '@prisma/client';
import { StylesService } from 'src/services';

@Controller('styles')
export class StylesController extends ReadController<styles> {
  constructor(service: StylesService) {
    super(service);
  }
}
