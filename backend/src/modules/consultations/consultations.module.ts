import { Module } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { MockVideoProvider } from './providers/mock-video.provider';

@Module({
  controllers: [ConsultationsController],
  providers: [ConsultationsService, MockVideoProvider],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
