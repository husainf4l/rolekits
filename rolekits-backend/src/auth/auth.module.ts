import { Module, forwardRef, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeyService } from './services/api-key.service';
import { ApiKeyResolver } from './resolvers/api-key.resolver';
import { SystemResolver } from './resolvers/system.resolver';
import { CombinedAuthGuard } from './guards/combined-auth.guard';
import { User } from '../users/entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey, User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
        signOptions: { expiresIn: (configService.get<string>('JWT_EXPIRATION') || '30m') as any },
      }),
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [
    AuthService, 
    AuthResolver, 
    JwtStrategy,
    ApiKeyService,
    ApiKeyResolver,
    SystemResolver,
    CombinedAuthGuard,
  ],
  exports: [AuthService, ApiKeyService, CombinedAuthGuard, JwtModule],
})
export class AuthModule {}
