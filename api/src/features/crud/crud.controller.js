import {
  Bind,
  Body,
  Param,
  Get,
  Post,
  Put,
  Delete,
  Dependencies,
} from '@nestjs/common';
import {QueryBus, CommandBus} from '@nestjs/cqrs';

import {FindAll} from './findAll';
import {FindOne} from './findOne';
import {Create} from './create';
import {Update} from './update';
import {Destroy} from './destroy';

@Dependencies(QueryBus, CommandBus)
export class CrudController {
  constructor(queryBus, commandBus) {
    this.queryBus = queryBus;
    this.commandBus = commandBus;
  }

  @Get(':id')
  @Bind(Param('id'))
  async findOne(id) {
    return this.queryBus.execute(new FindOne(this.tableName, id));
  }

  @Get()
  async findAll() {
    return this.queryBus.execute(new FindAll(this.tableName));
  }

  @Post()
  @Bind(Body())
  async create(body) {
    return this.commandBus.execute(new Create(this.tableName, body));
  }

  @Put(':id')
  @Bind(Param('id'), Body())
  async update(id, body) {
    return this.commandBus.execute(new Update(this.tableName, id, body));
  }

  @Delete(':id')
  @Bind(Param('id'))
  async remove(id) {
    return this.commandBus.execute(new Destroy(this.tableName, id));
  }
}
