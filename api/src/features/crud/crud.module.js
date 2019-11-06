import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {Database} from '../../database';

import {FindAllHandler} from './findAll';
import {FindOneHandler} from './findOne';
import {CreateHandler} from './create';
import {UpdateHandler} from './update';
import {DestroyHandler} from './destroy';

@Module({
  imports: [CqrsModule],
  providers: [
    Database,
    FindAllHandler,
    FindOneHandler,
    CreateHandler,
    UpdateHandler,
    DestroyHandler,
  ],
})
export class CrudModule {}
