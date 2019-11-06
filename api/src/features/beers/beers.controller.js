import {Controller} from '@nestjs/common';
import {TableName, CrudController} from '../crud';

@Controller('beers')
@TableName('beers')
export class BeersController extends CrudController {}
