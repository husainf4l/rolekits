import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ApiKeyResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  lastUsedAt?: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  active: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class CreateApiKeyResponse {
  @Field()
  key: string; // Plain key - only shown once!

  @Field(() => ApiKeyResponse)
  apiKey: ApiKeyResponse;
}
