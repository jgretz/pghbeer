import {Injectable} from '@nestjs/common';

import {PrismaService} from './prisma.service';

@Injectable()
export class BeersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.beers.findMany();
  }
}
