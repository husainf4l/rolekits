import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApiKeyService } from '../services/api-key.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Combined auth guard that accepts both JWT tokens and API keys
 * Priority: JWT Token > API Key
 */
@Injectable()
export class CombinedAuthGuard {
  constructor(
    private apiKeyService: ApiKeyService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    
    // Get request object (HTTP or WebSocket)
    let request = gqlContext.req;
    
    // For WebSocket subscriptions from extra
    if (gqlContext.extra?.req) {
      request = gqlContext.extra.req;
    }

    if (!request || !request.headers) {
      throw new UnauthorizedException('No request headers found');
    }

    const authHeader = request.headers.authorization || request.headers.Authorization;
    
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    // Try JWT first
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        const payload = this.jwtService.verify(token);
        request.user = { userId: payload.sub, username: payload.username };
        return true;
      } catch (error) {
        // JWT invalid, try API key
        console.log('JWT verification failed, trying API key');
      }
    }

    // Try API Key
    const apiKey = authHeader.replace('Bearer ', '').replace('ApiKey ', '');
    
    const validatedKey = await this.apiKeyService.validateApiKey(apiKey);
    
    if (validatedKey) {
      request.user = { 
        userId: validatedKey.userId, 
        username: validatedKey.user.username 
      };
      return true;
    }

    throw new UnauthorizedException('Invalid authentication credentials');
  }
}
