import {Module} from '@nestjs/common';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';

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
