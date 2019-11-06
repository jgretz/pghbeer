import {Controller} from '@nestjs/common';
import {TableName, CrudController} from '../crud';

@Controller('styles')
@TableName('styles')
export class StylesController extends CrudController {}
