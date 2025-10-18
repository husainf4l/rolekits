# NestJS Quick Start Guide - RoleKits Backend

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
cd rolekits-backend

# Core dependencies
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql @nestjs/typeorm typeorm pg @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/config bcrypt class-validator class-transformer graphql-subscriptions

# Dev dependencies
npm install -D @types/passport-jwt @types/bcrypt
```

### 2. Create .env File

```bash
cat > .env << EOF
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=rolekits
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRATION=30m
PORT=8003
NODE_ENV=development
EOF
```

### 3. Generate Modules

```bash
# Generate modules, services, and resolvers
nest g module users
nest g module cv
nest g module auth

nest g service users
nest g service cv
nest g service auth

nest g resolver users
nest g resolver cv
nest g resolver auth
```

---

## 📁 File Structure to Create

```
src/
├── app.module.ts                      ✅ Update this
├── main.ts                            ✅ Update this
├── config/
│   ├── database.config.ts             ⭐ CREATE
│   └── jwt.config.ts                  ⭐ CREATE
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts  ⭐ CREATE
│   └── guards/
│       └── gql-auth.guard.ts          ⭐ CREATE
├── users/
│   ├── entities/
│   │   └── user.entity.ts             ⭐ CREATE
│   ├── dto/
│   │   └── create-user.dto.ts         ⭐ CREATE
│   ├── users.service.ts               ✅ Update
│   ├── users.resolver.ts              ✅ Update
│   └── users.module.ts                ✅ Update
├── cv/
│   ├── entities/
│   │   └── cv.entity.ts               ⭐ CREATE
│   ├── dto/
│   │   ├── create-cv.input.ts         ⭐ CREATE
│   │   └── update-cv.input.ts         ⭐ CREATE
│   ├── cv.service.ts                  ✅ Update
│   ├── cv.resolver.ts                 ✅ Update
│   └── cv.module.ts                   ✅ Update
└── auth/
    ├── dto/
    │   ├── login.input.ts             ⭐ CREATE
    │   ├── signup.input.ts            ⭐ CREATE
    │   └── login-response.dto.ts      ⭐ CREATE
    ├── jwt.strategy.ts                ⭐ CREATE
    ├── auth.service.ts                ✅ Update
    ├── auth.resolver.ts               ✅ Update
    └── auth.module.ts                 ✅ Update
```

---

## 💾 Essential Code Files

### 1. Database Config (`src/config/database.config.ts`)

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production
  logging: true,
});
```

### 2. JWT Config (`src/config/jwt.config.ts`)

```typescript
import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRATION'),
  },
});
```

### 3. App Module (`src/app.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { CVModule } from './cv/cv.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      subscriptions: {
        'graphql-ws': true,
      },
      context: ({ req, connection }) => {
        if (req) return { req };
        return { req: connection.context };
      },
    }),
    UsersModule,
    CVModule,
    AuthModule,
  ],
})
export class AppModule {}
```

### 4. Main.ts (`src/main.ts`)

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 8003;
  await app.listen(port);
  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
}
bootstrap();
```

### 5. User Entity (`src/users/entities/user.entity.ts`)

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CV } from '../../cv/entities/cv.entity';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ unique: true })
  @Field()
  username: string;

  @Column()
  hashedPassword: string;

  @OneToMany(() => CV, cv => cv.user)
  @Field(() => [CV], { nullable: true })
  cvs?: CV[];
}
```

### 6. Auth Module (`src/auth/auth.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { getJwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

---

## 🧪 Testing Your Setup

### 1. Start the Server

```bash
npm run start:dev
```

You should see:
```
🚀 Server ready at http://localhost:8003/graphql
```

### 2. Open GraphQL Playground

Navigate to: `http://localhost:8003/graphql`

### 3. Test Queries

#### Signup Mutation
```graphql
mutation {
  signup(input: {
    username: "testuser"
    password: "password123"
  }) {
    id
    username
  }
}
```

#### Login Mutation
```graphql
mutation {
  login(input: {
    username: "testuser"
    password: "password123"
  }) {
    accessToken
    tokenType
  }
}
```

#### Set Authorization Header
In GraphQL Playground, add to HTTP Headers:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

#### Create CV
```graphql
mutation {
  createCV(input: {
    fullName: "John Doe"
    email: "john@example.com"
    phone: "+1234567890"
    summary: "Experienced developer"
  }) {
    id
    fullName
    email
    createdAt
  }
}
```

#### Get My CVs
```graphql
query {
  myCvs {
    id
    fullName
    email
    createdAt
    updatedAt
  }
}
```

---

## 🔧 Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run build             # Build for production
npm run start:prod        # Run production build

# Database
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
npm run typeorm migration:revert

# Testing
npm run test              # Run unit tests
npm run test:e2e          # Run e2e tests
npm run test:cov          # Test coverage

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format with Prettier
```

---

## 📊 Feature Comparison Table

| Feature | FastAPI (Current) | NestJS (Target) | Status |
|---------|------------------|-----------------|--------|
| Framework | FastAPI | NestJS | ✅ Ready |
| Language | Python | TypeScript | ✅ Ready |
| ORM | SQLAlchemy | TypeORM | ✅ Ready |
| GraphQL | Strawberry | Apollo Server | ✅ Ready |
| Auth | python-jose | @nestjs/jwt | ✅ Ready |
| Validation | Pydantic | class-validator | ✅ Ready |
| Real-time | SSE | WebSocket | ✅ Upgrade |
| API Docs | GraphiQL | GraphQL Playground | ✅ Ready |
| Testing | pytest | Jest | ✅ Ready |
| Migrations | Alembic | TypeORM | ✅ Ready |

---

## 🎯 Migration Steps (Day-by-Day)

### Day 1: Setup & Configuration
- ✅ Initialize NestJS project
- ✅ Install dependencies
- ✅ Configure environment variables
- ✅ Set up database connection
- ✅ Test basic server startup

### Day 2: Database Layer
- ✅ Create User entity
- ✅ Create CV entity
- ✅ Test database connectivity
- ✅ Run migrations

### Day 3: Authentication
- ✅ Implement JWT strategy
- ✅ Create auth service & resolver
- ✅ Test login/signup flow
- ✅ Implement guards

### Day 4: Business Logic
- ✅ Implement Users service
- ✅ Implement CV service
- ✅ Create all DTOs
- ✅ Add validation

### Day 5: GraphQL Layer
- ✅ Create all resolvers
- ✅ Implement queries
- ✅ Implement mutations
- ✅ Test all endpoints

### Day 6: Real-time Features
- ✅ Implement subscriptions
- ✅ Set up PubSub
- ✅ Test WebSocket connections
- ✅ Update frontend client

### Day 7: Testing & Deployment
- ✅ Write unit tests
- ✅ Write integration tests
- ✅ Set up Docker
- ✅ Deploy to staging

---

## 🐛 Troubleshooting

### Issue: Cannot connect to database
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -h localhost -p 5432
```

### Issue: JWT authentication not working
- Check JWT_SECRET in .env
- Verify Authorization header format: `Bearer <token>`
- Check token expiration time

### Issue: GraphQL Playground not loading
- Ensure `playground: true` in GraphQL config
- Check CORS settings
- Navigate to http://localhost:8003/graphql

### Issue: Entities not found
- Verify entity path in database config
- Check entity decorators (@Entity, @Column)
- Run `npm run build` to compile TypeScript

---

## 📚 Next Steps

1. **Complete Implementation**: Follow the main migration guide
2. **Add Tests**: Write comprehensive test coverage
3. **Documentation**: Document all GraphQL operations
4. **Performance**: Add caching, pagination, rate limiting
5. **Monitoring**: Set up logging and monitoring
6. **Security**: Add security headers, input sanitization
7. **CI/CD**: Set up automated deployment pipeline

---

## 🆘 Getting Help

- **NestJS Discord**: https://discord.gg/nestjs
- **Stack Overflow**: Tag questions with `nestjs`
- **GitHub Issues**: https://github.com/nestjs/nest/issues
- **Official Docs**: https://docs.nestjs.com

---

**Quick Start Version**: 1.0  
**Last Updated**: October 16, 2025
