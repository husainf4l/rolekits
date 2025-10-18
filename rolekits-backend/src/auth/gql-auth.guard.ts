import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    
    console.log('GqlAuthGuard - full context keys:', Object.keys(gqlContext));
    console.log('GqlAuthGuard - req exists:', !!gqlContext.req);
    console.log('GqlAuthGuard - req.headers:', gqlContext.req?.headers);
    console.log('GqlAuthGuard - token in context:', gqlContext.token);
    
    // For WebSocket subscriptions via connection context
    if (gqlContext.req && gqlContext.token) {
      console.log('WebSocket subscription detected - using req from onConnect');
      if (!gqlContext.req.headers) {
        gqlContext.req.headers = {};
      }
      return gqlContext.req;
    }
    
    // For HTTP requests (queries/mutations)
    const request = gqlContext.req;
    if (request && !request.headers) {
      request.headers = {};
    }
    
    return request || {};
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('GqlAuthGuard handleRequest - user:', user);
    console.log('GqlAuthGuard handleRequest - err:', err);
    console.log('GqlAuthGuard handleRequest - info:', info);
    
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
