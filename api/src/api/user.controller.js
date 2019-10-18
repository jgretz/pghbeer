import {Controller, Dependencies} from '@nestjs/common';
import {UserService} from '../services';
import CrudController from './crud.controller';

@Controller('users')
@Dependencies(UserService)
export default class UserController extends CrudController {
  constructor(userService) {
    super(userService);
  }
}
