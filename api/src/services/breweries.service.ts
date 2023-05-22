import {Injectable} from '@nestjs/common';

import {PrismaService} from './prisma.service';

@Injectable()
export class BreweriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.breweries.findMany();
  }
}
