import { Module } from '@nestjs/common';
import {
  PrismaService,
  BeersService,
  BreweriesService,
  EventBeersService,
  EventsService,
  StylesService,
} from './services';
import {
  BeersController,
  BreweriesController,
  EventBeersController,
  EventsController,
  StylesController,
} from './controllers';

@Module({
  imports: [],
  controllers: [
    BeersController,
    BreweriesController,
    EventBeersController,
    EventsController,
    StylesController,
  ],
  providers: [
    PrismaService,
    BeersService,
    BreweriesService,
    EventBeersService,
    EventsService,
    StylesService,
  ],
})
export class AppModule {}
