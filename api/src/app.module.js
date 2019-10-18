import {Module} from '@nestjs/common';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';

import {
  BeerController,
  BreweryController,
  EdgeController,
  EventController,
  StatController,
  StyleController,
  UserController,
} from './api';
import {
  BeerService,
  BreweryService,
  EdgeService,
  EventService,
  StatService,
  StyleService,
  UserService,
} from './services';
import {GraphClient} from './graph';

const clientPath = () => {
  if (process.env.NODE_ENV === 'PRODUCTION') {
    return join(__dirname, '/site');
  }

  return join(__dirname, '../../lib/site');
};

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: clientPath(),
      renderPath: '/',
    }),
  ],
  controllers: [
    BeerController,
    BreweryController,
    EdgeController,
    EventController,
    StatController,
    StyleController,
    UserController,
  ],
  providers: [
    GraphClient,
    BeerService,
    BreweryService,
    EdgeService,
    EventService,
    StatService,
    StyleService,
    UserService,
  ],
})
export class AppModule {}
