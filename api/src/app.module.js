import {Module} from '@nestjs/common';
import {BeerController} from './api/beer';
import {BeerService} from './services';
import {GraphClient} from './graph';

@Module({
  imports: [],
  controllers: [BeerController],
  providers: [GraphClient, BeerService],
})
export class AppModule {}
