import {Injectable, Dependencies} from '@nestjs/common';
import {GraphClient} from '../graph';
import CrudService from './crud.service';

@Injectable()
@Dependencies(GraphClient)
export default class BeerService extends CrudService {
  constructor(graphClient) {
    super(graphClient, 'style', 'style');
  }
}
