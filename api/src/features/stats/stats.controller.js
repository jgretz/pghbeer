import {Controller} from '@nestjs/common';
import {TableName, CrudController} from '../crud';

@Controller('stats')
@TableName('stats')
export class StatsController extends CrudController {}
