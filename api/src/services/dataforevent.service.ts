import {Injectable} from '@nestjs/common';

import {PrismaService} from './prisma.service';

@Injectable()
export class DataForEventService {
  constructor(private prisma: PrismaService) {}

  async findAll(event_id: number) {
    return await this.prisma.eventbeerlist.findMany({
      select: {
        beer: {
          select: {
            name: true,
            abv: true,

            brewery: {
              select: {
                name: true,
              },
            },
            style: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        event_id,
      },
    });
  }
}
