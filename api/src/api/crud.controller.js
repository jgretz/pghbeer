import {Bind, Body, Param, Get, Post, Put, Delete} from '@nestjs/common';

export default class CrudController {
  constructor(crudService) {
    this.crudService = crudService;
  }

  @Get(':id')
  @Bind(Param('id'))
  async findOne(id) {
    return await this.crudService.findById(id);
  }

  @Get()
  async findAll() {
    return await this.crudService.findAll();
  }

  @Post()
  @Bind(Body())
  async create(body) {
    return await this.crudService.create(body);
  }

  @Put(':id')
  @Bind(Param('id'), Body())
  async update(id, body) {
    return await this.crudService.update(id, body);
  }

  @Delete(':id')
  @Bind(Param('id'))
  async remove(id) {
    return await this.crudService.remove(id);
  }
}
