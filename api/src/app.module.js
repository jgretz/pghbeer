import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';

import {BeersController} from './features/beers';
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
  controllers: [BeersController],
})
export class AppModule {}
