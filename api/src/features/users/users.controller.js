import {Controller} from '@nestjs/common';
import {TableName, CrudController} from '../crud';

@Controller('users')
@TableName('users')
export class UsersController extends CrudController {}
