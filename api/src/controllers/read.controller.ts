import {Get} from '@nestjs/common';
import {ReadService} from '../Types';

export class ReadController<T> {
  private service: ReadService<T>;

  constructor(service: ReadService<T>) {
    this.service = service;
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }
}
