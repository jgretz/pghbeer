import {Controller} from '@nestjs/common';
import {TableName, CrudController} from '../crud';

@Controller('users')
@TableName('users')
export default class UsersController extends CrudController {}
