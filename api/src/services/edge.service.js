import {Injectable, Dependencies} from '@nestjs/common';
import {GraphClient} from '../graph';

@Injectable()
@Dependencies(GraphClient)
export default class EdgeService {
  constructor(graphClient) {
    this.g = graphClient;
  }

  async create(obj) {
    const query = def =>
      Object.keys(def.properties).reduce((current, key) => {
        return current.has(key, def.properties[key]);
      }, this.g.V(def.v));

    const from = query(obj.from);
    const to = query(obj.to);

    return await from
      .addE(obj.label)
      .to(to)
      .submit();
  }
}
