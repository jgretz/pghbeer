import {Module} from '@nestjs/common';
import {
  PrismaService,
  BeersService,
  BreweriesService,
  DataForEventService,
  EventBeersService,
  EventsService,
  StatsService,
  StylesService,
  UsersService,
} from './services';
import {
  BeersController,
  BreweriesController,
  DataEventForEventController,
  EventBeersController,
  EventsController,
  StatsController,
  StylesController,
} from './controllers';

@Module({
  imports: [],
  controllers: [
    BeersController,
    BreweriesController,
    DataEventForEventController,
    EventBeersController,
    EventsController,
    StatsController,
    StylesController,
  ],
  providers: [
    PrismaService,
    BeersService,
    BreweriesService,
    DataForEventService,
    EventBeersService,
    EventsService,
    StatsService,
    StylesService,
    UsersService,
  ],
})
export class AppModule {}
