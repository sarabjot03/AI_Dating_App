import { Module } from '@nestjs/common';

import { FeedModule } from '../feed/feed.module';
import { DiscoverController } from './discover.controller';

@Module({
  imports: [FeedModule],
  controllers: [DiscoverController],
})
export class DiscoverModule {}
