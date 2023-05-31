import {Injectable} from '@nestjs/common';

import {PrismaService} from './prisma.service';
import {UsersService} from './users.service';
import {StatOpinion} from 'src/Types';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService, private usersService: UsersService) {}

  async findAll(event_id: number) {
    return await this.prisma.stats.findMany({
      select: {
        opinion: true,
        user_id: true,
        date: true,

        beer: {
          select: {
            id: true,
            name: true,
            abv: true,

            brewery: {
              select: {
                id: true,
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

  async updateStats(beerId: number, eventId: number, userId: string, tasted: boolean) {
    const user = await this.usersService.findOrCreate(userId);

    const stat = await this.prisma.stats.findFirst({
      where: {
        beer_id: beerId,
        event_id: eventId,
        user_id: user.id,
      },
    });

    // update existing record
    if (tasted && stat) {
      await this.prisma.stats.update({
        data: {
          opinion: StatOpinion.Tasted,
          update_date: new Date(),
        },
        where: {
          id: stat.id,
        },
      });
      return;
    }

    // create record
    if (tasted && !stat) {
      await this.prisma.stats.create({
        data: {
          date: new Date(),
          beer_id: beerId,
          event_id: eventId,
          user_id: user.id,
          opinion: StatOpinion.Tasted,
          create_date: new Date(),
          update_date: new Date(),
        },
      });
    }

    // whack record
    if (!tasted && stat) {
      await this.prisma.stats.delete({
        where: {
          id: stat.id,
        },
      });
    }
  }
}
