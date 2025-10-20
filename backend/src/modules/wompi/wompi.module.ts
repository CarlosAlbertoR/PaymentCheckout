import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WompiService } from './wompi.service';
import { WompiController } from './wompi.controller';

@Module({
  imports: [HttpModule],
  controllers: [WompiController],
  providers: [WompiService],
  exports: [WompiService],
})
export class WompiModule {}
