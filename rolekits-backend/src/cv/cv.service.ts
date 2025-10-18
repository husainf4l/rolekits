import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CV } from './entities/cv.entity';
import { CreateCVInput } from './dto/create-cv.input';
import { UpdateCVInput } from './dto/update-cv.input';
import { pubSub } from './pubsub';

@Injectable()
export class CVService {
  constructor(
    @InjectRepository(CV)
    private cvRepository: Repository<CV>,
  ) {}

  async create(userId: string, createCVInput: CreateCVInput): Promise<CV> {
    const cv = this.cvRepository.create({
      ...createCVInput,
      userId,
    });
    const savedCV = await this.cvRepository.save(cv);
    
    // Publish update for subscriptions
    await pubSub.publish('cvUpdates', { cvUpdates: savedCV });
    console.log('📤 Published CV create for:', savedCV.id, savedCV.fullName);
    
    return savedCV;
  }

  async findAllByUser(userId: string): Promise<CV[]> {
    return this.cvRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async findOne(id: string, userId?: string): Promise<CV> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (userId && cv.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this CV');
    }

    return cv;
  }

  async update(
    id: string,
    userId: string,
    updateCVInput: UpdateCVInput,
  ): Promise<CV> {
    const cv = await this.findOne(id, userId);
    
    Object.assign(cv, updateCVInput);
    const updatedCV = await this.cvRepository.save(cv);
    
    // Publish update for subscriptions
    await pubSub.publish('cvUpdates', { cvUpdates: updatedCV });
    console.log('📤 Published CV update for:', updatedCV.id, updatedCV.fullName);
    
    return updatedCV;
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const cv = await this.findOne(id, userId);
    await this.cvRepository.remove(cv);
    return true;
  }

  // For subscriptions - returns the plain async iterator
  getCVUpdatesAsyncIterator() {
    return pubSub.asyncIterableIterator('cvUpdates');
  }
}
