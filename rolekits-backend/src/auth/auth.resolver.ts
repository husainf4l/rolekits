import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response.dto';
import { SignupResponse } from './dto/signup-response.dto';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
    return this.authService.login(input.username, input.password);
  }

  @Mutation(() => SignupResponse)
  async signup(@Args('input') input: SignupInput): Promise<SignupResponse> {
    return this.authService.signup(input.username, input.password);
  }
}
