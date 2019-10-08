import {Module} from '@nestjs/common';
import {
  BeerController,
  BreweryController,
  EventController,
  StyleController,
  UserController,
} from './api';
import {
  BeerService,
  BreweryService,
  EventService,
  StyleService,
  UserService,
} from './services';
import {GraphClient} from './graph';

@Module({
  imports: [],
  controllers: [BeerController],
  providers: [
    GraphClient,
    BeerService,
    BreweryService,
    EventService,
    StyleService,
    UserService,
  ],
})
export class AppModule {}
