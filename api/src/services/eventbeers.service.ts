import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Injectable()
export class EventBeersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.eventbeerlist.findMany();
  }
}
