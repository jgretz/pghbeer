import {Controller} from '@nestjs/common';
import {TableName, CrudController} from '../crud';

@Controller('events')
@TableName('events')
export class EventsController extends CrudController {}
