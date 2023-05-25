import {Injectable} from '@nestjs/common';

import {PrismaService} from './prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(userId: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        webuserid: userId,
      },
    });

    if (user) {
      return user;
    }

    return await this.prisma.users.create({
      data: {
        webuserid: userId,
        create_date: new Date(),
        update_date: new Date(),
      },
    });
  }
}
