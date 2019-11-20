import {Module, CacheModule, CacheInterceptor} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {ServeStaticModule} from '@nestjs/serve-static';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {join} from 'path';

import {Database} from './database';
import {BeersController} from './features/beers';
import {BreweriesController} from './features/breweries';
import {EventsController, EventBeerListController} from './features/events';
import {
  StatsController,
  StatsForUserController,
  FindStatsByWebUserIdHandler,
} from './features/stats';
import {StylesController} from './features/styles';
import {
  UsersController,
  UserByWebUserIdController,
  FindUserByWebUserIdHandler,
} from './features/users';
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
    CacheModule.register(),
  ],
  providers: [
    Database,
    FindStatsByWebUserIdHandler,
    FindUserByWebUserIdHandler,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  controllers: [
    BeersController,
    BreweriesController,
    EventsController,
    EventBeerListController,
    StatsController,
    StatsForUserController,
    StylesController,
    UsersController,
    UserByWebUserIdController,
  ],
})
export class AppModule {}
