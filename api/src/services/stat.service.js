import {Injectable, Dependencies} from '@nestjs/common';
import {GraphClient} from '../graph';
import CrudService from './crud.service';

@Injectable()
@Dependencies(GraphClient)
export default class StatService extends CrudService {
  constructor(graphClient) {
    super(graphClient, 'stat', 'stat');
  }
}
