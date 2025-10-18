import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ApiKeyService } from '../services/api-key.service';
import { CreateApiKeyInput } from '../dto/create-api-key.input';
import { CreateApiKeyResponse, ApiKeyResponse } from '../dto/api-key-response.dto';
import { GqlAuthGuard } from '../gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
export class ApiKeyResolver {
  constructor(private apiKeyService: ApiKeyService) {}

  @Mutation(() => CreateApiKeyResponse)
  @UseGuards(GqlAuthGuard)
  async createApiKey(
    @Args('input') input: CreateApiKeyInput,
    @CurrentUser() user: any,
  ): Promise<CreateApiKeyResponse> {
    const result = await this.apiKeyService.createApiKey(
      user.userId,
      input.name,
      input.expiresInDays,
    );
    
    return {
      key: result.key,
      apiKey: result.apiKey as any,
    };
  }

  @Query(() => [ApiKeyResponse])
  @UseGuards(GqlAuthGuard)
  async myApiKeys(@CurrentUser() user: any): Promise<ApiKeyResponse[]> {
    return this.apiKeyService.findAllByUser(user.userId) as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async revokeApiKey(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.apiKeyService.revokeApiKey(id, user.userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteApiKey(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.apiKeyService.deleteApiKey(id, user.userId);
  }
}
