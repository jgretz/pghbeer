import {Controller, Dependencies, Get} from '@nestjs/common';
import {BeerService} from '../../services';

@Controller('beer')
@Dependencies(BeerService)
export default class BeerController {
  constructor(beerService) {
    this.beerService = beerService;
  }

  @Get()
  async findAll() {
    return await this.beerService.getBeers();
  }
}
