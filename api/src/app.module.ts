import {Module} from '@nestjs/common';
import {
  PrismaService,
  BeersService,
  BreweriesService,
  DataForEventService,
  EventBeersService,
  EventsService,
  StylesService,
} from './services';
import {
  BeersController,
  BreweriesController,
  DataEventForEventController,
  EventBeersController,
  EventsController,
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
    StylesController,
  ],
  providers: [
    PrismaService,
    BeersService,
    BreweriesService,
    DataForEventService,
    EventBeersService,
    EventsService,
    StylesService,
  ],
})
export class AppModule {}
