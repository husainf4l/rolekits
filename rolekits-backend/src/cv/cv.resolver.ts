import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CVService } from './cv.service';
import { CV } from './entities/cv.entity';
import { CreateCVInput } from './dto/create-cv.input';
import { UpdateCVInput } from './dto/update-cv.input';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { pubSub } from './pubsub';

@Resolver(() => CV)
export class CVResolver {
  constructor(private readonly cvService: CVService) {}

  @Mutation(() => CV)
  @UseGuards(CombinedAuthGuard)
  async createCV(
    @Args('input') createCVInput: CreateCVInput,
    @CurrentUser() user: any,
  ): Promise<CV> {
    return this.cvService.create(user.userId, createCVInput);
  }

  @Query(() => [CV], { name: 'myCvs' })
  @UseGuards(CombinedAuthGuard)
  async findAllByUser(@CurrentUser() user: any): Promise<CV[]> {
    return this.cvService.findAllByUser(user.userId);
  }

  @Query(() => CV, { name: 'cv' })
  @UseGuards(CombinedAuthGuard)
  async findOne(
    @Args('cvId') cvId: string,
    @CurrentUser() user: any,
  ): Promise<CV> {
    return this.cvService.findOne(cvId, user.userId);
  }

  @Mutation(() => CV)
  @UseGuards(CombinedAuthGuard)
  async updateCV(
    @Args('cvId') cvId: string,
    @Args('input') updateCVInput: UpdateCVInput,
    @CurrentUser() user: any,
  ): Promise<CV> {
    return this.cvService.update(cvId, user.userId, updateCVInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(CombinedAuthGuard)
  async deleteCV(
    @Args('cvId') cvId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.cvService.remove(cvId, user.userId);
  }

  @Subscription(() => CV, {
    name: 'cvUpdates',
    filter: (payload, variables) => {
      console.log('Filter payload:', payload);
      console.log('Filter variables:', variables);
      if (!payload.cvUpdates) {
        console.log('No cvUpdates in payload');
        return false;
      }
      const match = payload.cvUpdates.id === variables.cvId;
      console.log(`Filter check: ${payload.cvUpdates.id} === ${variables.cvId} = ${match}`);
      return match;
    },
  })
  @UseGuards(GqlAuthGuard)
  async cvUpdates(
    @Args('cvId') cvId: string,
    @CurrentUser() user: any,
  ) {
    console.log('========================================');
    console.log('Client subscribed to CV updates for:', cvId);
    console.log('User:', user);
    console.log('========================================');
    
    // Send initial data after a small delay to ensure subscription is ready
    setImmediate(async () => {
      try {
        const currentCV = await this.cvService.findOne(cvId);
        if (currentCV) {
          console.log('Sending initial CV data:', currentCV.fullName);
          await pubSub.publish('cvUpdates', {
            cvUpdates: currentCV,
          });
        }
      } catch (error) {
        console.error('Error fetching initial CV:', error.message);
      }
    });
    
    return pubSub.asyncIterableIterator('cvUpdates');
  }
}
