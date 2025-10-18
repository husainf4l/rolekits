import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CVService } from './cv.service';
import { CVResolver } from './cv.resolver';
import { CV } from './entities/cv.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CV, User]),
  ],
  providers: [CVService, CVResolver],
  exports: [CVService],
})
export class CVModule {}
