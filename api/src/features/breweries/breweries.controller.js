import {Controller} from '@nestjs/common';
import {TableName, CrudController} from '../crud';

@Controller('breweries')
@TableName('breweries')
export class BreweriesController extends CrudController {}
