import {Injectable, Dependencies} from '@nestjs/common';
import {GraphClient} from '../graph';

@Injectable()
@Dependencies(GraphClient)
export default class CrudService {
  constructor(graphClient) {
    this.g = graphClient;
  }

  async create(obj) {
    return [];
  }
}
