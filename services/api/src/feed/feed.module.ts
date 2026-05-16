import { Module } from '@nestjs/common';

import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { SwipesController } from './swipes.controller';

@Module({
  controllers: [FeedController, SwipesController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
