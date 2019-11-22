import {Module, CacheModule, CacheInterceptor} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {ServeStaticModule} from '@nestjs/serve-static';
import {APP_INTERCEPTOR} from '@nestjs/core';

import {resolveClientPlath} from '../services';

import {Database} from './database';
import {BeersController} from './features/beers';
import {BreweriesController} from './features/breweries';
import {EventsController, EventBeerListController} from './features/events';
import {
  StatsController,
  StatsForUserController,
  StatsForEventController,
  FindStatsByWebUserIdHandler,
  FindStatsByEventIdHandler,
} from './features/stats';
import {StylesController} from './features/styles';
import {
  UsersController,
  UserByWebUserIdController,
  FindUserByWebUserIdHandler,
} from './features/users';
import {CrudModule} from './features/crud';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: resolveClientPlath(),
      renderPath: '/*',
    }),
    CqrsModule,
    CrudModule,
    CacheModule.register(),
  ],
  providers: [
    Database,
    FindStatsByWebUserIdHandler,
    FindUserByWebUserIdHandler,
    FindStatsByEventIdHandler,
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
    StatsForEventController,
    StylesController,
    UsersController,
    UserByWebUserIdController,
  ],
})
export class AppModule {}
