import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {PrismaService} from './services/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
