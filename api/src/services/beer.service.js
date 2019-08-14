import {Injectable, Dependencies} from '@nestjs/common';
import {GraphClient} from '../graph';

@Injectable()
@Dependencies(GraphClient)
export default class BeerService {
  constructor(graphClient) {
    this.g = graphClient;
  }

  async getBeers() {
    return g.V('beer');
  }
}
