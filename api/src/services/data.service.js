import {Injectable, Dependencies} from '@nestjs/common';
import {GraphClient} from '../graph';

@Injectable()
@Dependencies(GraphClient)
export default class DataService {
  constructor(graphClient) {
    this.g = graphClient;
  }

  async compileData() {
    return await this.g
      .V(this.label)
      .hasId(id)
      .submit();
  }
}
