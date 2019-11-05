import {Controller, Dependencies, Get} from '@nestjs/common';
import {DataService} from '../services';

@Controller('data')
@Dependencies(DataService)
export default class DataController {
  constructor(dataService) {
    this.dataService = dataService;
  }

  @Get()
  async compileData() {
    return await this.dataService.compile();
  }
}
