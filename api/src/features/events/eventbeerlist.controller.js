import {Controller} from '@nestjs/common';
import {TableName, CrudController} from '../crud';

@Controller('eventbeerlist')
@TableName('eventbeerlist')
export class EventBeerListController extends CrudController {}
