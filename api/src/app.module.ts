import { Module } from '@nestjs/common';
import { BeersController } from './controllers/beers.controller';
import {
  PrismaService,
  BeersService,
  BreweriesService,
  EventBeersService,
  EventsService,
  StylesService,
} from './services';

@Module({
  imports: [],
  controllers: [BeersController],
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
