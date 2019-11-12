import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';

import {BeersController} from './features/beers';
import {BreweriesController} from './features/breweries';
import {EventsController, EventBeerListController} from './features/events';
import {StatsController} from './features/stats';
import {StylesController} from './features/styles';
import {UsersController} from './features/users';
import {CrudModule} from './features/crud';

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
    CqrsModule,
    CrudModule,
  ],
  controllers: [
    BeersController,
    BreweriesController,
    EventsController,
    EventBeerListController,
    StatsController,
    StylesController,
    UsersController,
  ],
})
export class AppModule {}
