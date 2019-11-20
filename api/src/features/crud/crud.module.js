import {Module, CacheModule, CacheInterceptor} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {APP_INTERCEPTOR} from '@nestjs/core';

import {Database} from '../../database';

import {FindAllHandler} from './findAll';
import {FindOneHandler} from './findOne';
import {CreateHandler} from './create';
import {UpdateHandler} from './update';
import {DestroyHandler} from './destroy';

@Module({
  imports: [CqrsModule, CacheModule.register()],
  providers: [
    Database,
    FindAllHandler,
    FindOneHandler,
    CreateHandler,
    UpdateHandler,
    DestroyHandler,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class CrudModule {}
