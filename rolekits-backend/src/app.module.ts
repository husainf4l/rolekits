import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { CVModule } from './cv/cv.module';
import { AuthModule } from './auth/auth.module';
import { SystemUserSeeder } from './common/seeders/system-user.seeder';
import { User } from './users/entities/user.entity';
import { ApiKey } from './auth/entities/api-key.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    TypeOrmModule.forFeature([User, ApiKey]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // Generate schema automatically
      sortSchema: true,
      playground: true, // Enable GraphQL Playground
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: any) => {
            const { connectionParams, extra } = context;
            
            // Extract JWT token from various possible field names
            const token = connectionParams?.token 
              || connectionParams?.authToken 
              || connectionParams?.authorization?.replace('Bearer ', '')
              || connectionParams?.Authorization?.replace('Bearer ', '');
            
            console.log('🔌 WebSocket connecting with token:', token ? 'Present' : 'Missing');
            
            // Store in extra for subscription context
            extra.token = token;
            extra.req = {
              headers: {
                authorization: token ? `Bearer ${token}` : '',
              },
            };
          },
        },
      },
      context: ({ req, connection, extra }) => {
        // For WebSocket subscriptions - get from extra
        if (extra?.req) {
          console.log('Using WebSocket context from extra');
          return {
            req: extra.req,
            token: extra.token,
          };
        }
        
        // For HTTP queries/mutations
        if (req) {
          return { req };
        }
        
        // Fallback
        return {};
      },
    }),
    UsersModule,
    CVModule,
    AuthModule,
  ],
  providers: [SystemUserSeeder],
})
export class AppModule {}
