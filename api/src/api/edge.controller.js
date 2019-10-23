import {Controller, Dependencies, Bind, Body, Post} from '@nestjs/common';
import {EdgeService} from '../services';

@Controller('edge')
@Dependencies(EdgeService)
export default class EdgeController {
  constructor(edgeService) {
    this.edgeService = edgeService;
  }

  @Post()
  @Bind(Body())
  async create(body) {
    return await this.edgeService.create(body);
  }
}
