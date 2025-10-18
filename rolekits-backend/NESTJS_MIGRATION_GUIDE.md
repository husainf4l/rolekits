# NestJS Migration Guide - RoleKits Backend

## Table of Contents
1. [Overview](#overview)
2. [Architecture Comparison](#architecture-comparison)
3. [Technology Stack](#technology-stack)
4. [Project Setup](#project-setup)
5. [Database Migration (SQLAlchemy → TypeORM)](#database-migration)
6. [Authentication Implementation](#authentication-implementation)
7. [GraphQL Implementation (Strawberry → Apollo)](#graphql-implementation)
8. [Real-time Features](#real-time-features)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Considerations](#deployment-considerations)

---

## Overview

This guide provides comprehensive instructions for migrating the RoleKits backend from **FastAPI (Python)** to **NestJS (TypeScript)** with TypeORM and Apollo GraphQL.

### Current Stack (FastAPI)
- **Framework**: FastAPI
- **ORM**: SQLAlchemy (async)
- **GraphQL**: Strawberry
- **Auth**: JWT with python-jose & bcrypt
- **Database**: PostgreSQL/SQLite
- **Real-time**: Server-Sent Events (SSE)

### Target Stack (NestJS)
- **Framework**: NestJS
- **ORM**: TypeORM
- **GraphQL**: Apollo Server (with @nestjs/graphql)
- **Auth**: JWT with @nestjs/jwt & bcrypt
- **Database**: PostgreSQL
- **Real-time**: GraphQL Subscriptions (WebSocket)

---

## Architecture Comparison

### FastAPI Structure
```
rolekits/
├── main.py                 # Application entry
├── models/                 # SQLAlchemy models
│   ├── user.py
│   └── cv.py
├── schemas/                # Pydantic schemas
├── routers/                # REST API routes
├── services/               # Business logic
├── gql/                    # GraphQL layer
│   ├── schema.py
│   ├── types.py
│   └── resolvers.py
└── database.py             # Database configuration
```

### NestJS Structure (Target)
```
src/
├── main.ts                 # Application bootstrap
├── app.module.ts           # Root module
├── config/                 # Configuration
│   ├── database.config.ts
│   └── jwt.config.ts
├── common/                 # Shared utilities
│   ├── decorators/
│   ├── guards/
│   └── interceptors/
├── users/                  # User module
│   ├── entities/
│   │   └── user.entity.ts
│   ├── dto/
│   ├── users.service.ts
│   ├── users.resolver.ts
│   └── users.module.ts
├── cv/                     # CV module
│   ├── entities/
│   │   └── cv.entity.ts
│   ├── dto/
│   ├── cv.service.ts
│   ├── cv.resolver.ts
│   └── cv.module.ts
└── auth/                   # Authentication module
    ├── auth.service.ts
    ├── auth.resolver.ts
    ├── jwt.strategy.ts
    ├── gql-auth.guard.ts
    └── auth.module.ts
```

---

## Technology Stack

### Required Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/graphql": "^12.0.0",
    "@nestjs/apollo": "^12.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@apollo/server": "^4.0.0",
    "graphql": "^16.8.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "graphql-subscriptions": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^3.0.0",
    "@types/bcrypt": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Project Setup

### Step 1: Initialize NestJS Project

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create new project (already done)
cd rolekits-backend

# Install dependencies
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config
npm install bcrypt class-validator class-transformer
npm install graphql-subscriptions

# Install dev dependencies
npm install -D @types/passport-jwt @types/bcrypt
```

### Step 2: Configure Environment Variables

Create `.env` file:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=rolekits

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRATION=30m

# Application
PORT=8003
NODE_ENV=development
```

### Step 3: Update `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 8003;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/graphql`);
}
bootstrap();
```

---

## Database Migration

### TypeORM Entity Examples

#### User Entity (`src/users/entities/user.entity.ts`)

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
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
  hashedPassword: string; // Not exposed in GraphQL

  @OneToMany(() => CV, cv => cv.user, { cascade: true })
  @Field(() => [CV], { nullable: true })
  cvs?: CV[];
}
```

#### CV Entity (`src/cv/entities/cv.entity.ts`)

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Experience {
  @Field()
  company: string;

  @Field()
  position: string;

  @Field()
  startDate: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class Education {
  @Field()
  institution: string;

  @Field()
  degree: string;

  @Field()
  fieldOfStudy: string;

  @Field()
  startDate: string;

  @Field({ nullable: true })
  endDate?: string;
}

@ObjectType()
export class Language {
  @Field()
  language: string;

  @Field()
  proficiency: string;
}

@ObjectType()
export class Certification {
  @Field()
  name: string;

  @Field()
  issuer: string;

  @Field()
  date: string;
}

@ObjectType()
export class Project {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  url?: string;
}

@ObjectType()
export class Reference {
  @Field()
  name: string;

  @Field()
  position: string;

  @Field()
  company: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;
}

@Entity('cvs')
@ObjectType()
export class CV {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field(() => Int)
  userId: number;

  @ManyToOne(() => User, user => user.cvs)
  @Field(() => User)
  user: User;

  // Personal Information
  @Column({ nullable: true })
  @Field({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  linkedin?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  github?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  website?: string;

  // Professional Summary
  @Column('text', { nullable: true })
  @Field({ nullable: true })
  summary?: string;

  // JSON columns for complex data
  @Column('jsonb', { nullable: true })
  @Field(() => [Experience], { nullable: true })
  experience?: Experience[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Education], { nullable: true })
  education?: Education[];

  @Column('jsonb', { nullable: true })
  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Language], { nullable: true })
  languages?: Language[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Certification], { nullable: true })
  certifications?: Certification[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Project], { nullable: true })
  projects?: Project[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Reference], { nullable: true })
  references?: Reference[];

  // Metadata
  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
```

### Database Configuration (`src/config/database.config.ts`)

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
  synchronize: configService.get('NODE_ENV') === 'development', // Disable in production
  logging: configService.get('NODE_ENV') === 'development',
});
```

---

## Authentication Implementation

### JWT Strategy (`src/auth/jwt.strategy.ts`)

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, username: payload.username };
  }
}
```

### GraphQL Auth Guard (`src/auth/gql-auth.guard.ts`)

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

### Auth Service (`src/auth/auth.service.ts`)

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.hashedPassword)) {
      const { hashedPassword, ...result } = user;
      return result;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Incorrect username or password');
    }
    
    const payload = { username: user.username, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'bearer',
    };
  }

  async signup(username: string, password: string) {
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.create({ username, hashedPassword });
  }
}
```

### Auth Resolver (`src/auth/auth.resolver.ts`)

```typescript
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response.dto';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';
import { User } from '../users/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
    return this.authService.login(input.username, input.password);
  }

  @Mutation(() => User)
  async signup(@Args('input') input: SignupInput): Promise<User> {
    return this.authService.signup(input.username, input.password);
  }
}
```

### DTOs

#### Login Input (`src/auth/dto/login.input.ts`)

```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  username: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  password: string;
}
```

#### Login Response (`src/auth/dto/login-response.dto.ts`)

```typescript
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  tokenType: string;
}
```

---

## GraphQL Implementation

### App Module Configuration (`src/app.module.ts`)

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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // Generate schema automatically
      sortSchema: true,
      playground: true, // Enable GraphQL Playground
      subscriptions: {
        'graphql-ws': true, // Enable WebSocket subscriptions
      },
      context: ({ req, connection }) => {
        // For queries/mutations
        if (req) {
          return { req };
        }
        // For subscriptions
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

### CV Service (`src/cv/cv.service.ts`)

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CV } from './entities/cv.entity';
import { CreateCVInput } from './dto/create-cv.input';
import { UpdateCVInput } from './dto/update-cv.input';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Injectable()
export class CVService {
  constructor(
    @InjectRepository(CV)
    private cvRepository: Repository<CV>,
  ) {}

  async create(userId: number, createCVInput: CreateCVInput): Promise<CV> {
    const cv = this.cvRepository.create({
      ...createCVInput,
      userId,
    });
    const savedCV = await this.cvRepository.save(cv);
    
    // Publish update for subscriptions
    pubSub.publish(`cvUpdated_${userId}`, { cvUpdated: savedCV });
    
    return savedCV;
  }

  async findAllByUser(userId: number): Promise<CV[]> {
    return this.cvRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async findOne(id: number, userId: number): Promise<CV> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (cv.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this CV');
    }

    return cv;
  }

  async update(
    id: number,
    userId: number,
    updateCVInput: UpdateCVInput,
  ): Promise<CV> {
    const cv = await this.findOne(id, userId);
    
    Object.assign(cv, updateCVInput);
    const updatedCV = await this.cvRepository.save(cv);
    
    // Publish update for subscriptions
    pubSub.publish(`cvUpdated_${userId}`, { cvUpdated: updatedCV });
    
    return updatedCV;
  }

  async remove(id: number, userId: number): Promise<boolean> {
    const cv = await this.findOne(id, userId);
    await this.cvRepository.remove(cv);
    return true;
  }

  // For subscriptions
  getCVUpdateIterator(userId: number) {
    return pubSub.asyncIterator(`cvUpdated_${userId}`);
  }
}
```

### CV Resolver (`src/cv/cv.resolver.ts`)

```typescript
import { Resolver, Query, Mutation, Args, Int, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CVService } from './cv.service';
import { CV } from './entities/cv.entity';
import { CreateCVInput } from './dto/create-cv.input';
import { UpdateCVInput } from './dto/update-cv.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => CV)
export class CVResolver {
  constructor(private readonly cvService: CVService) {}

  @Mutation(() => CV)
  @UseGuards(GqlAuthGuard)
  async createCV(
    @Args('input') createCVInput: CreateCVInput,
    @CurrentUser() user: any,
  ): Promise<CV> {
    return this.cvService.create(user.userId, createCVInput);
  }

  @Query(() => [CV], { name: 'myCvs' })
  @UseGuards(GqlAuthGuard)
  async findAllByUser(@CurrentUser() user: any): Promise<CV[]> {
    return this.cvService.findAllByUser(user.userId);
  }

  @Query(() => CV, { name: 'cv' })
  @UseGuards(GqlAuthGuard)
  async findOne(
    @Args('cvId', { type: () => Int }) cvId: number,
    @CurrentUser() user: any,
  ): Promise<CV> {
    return this.cvService.findOne(cvId, user.userId);
  }

  @Mutation(() => CV)
  @UseGuards(GqlAuthGuard)
  async updateCV(
    @Args('cvId', { type: () => Int }) cvId: number,
    @Args('input') updateCVInput: UpdateCVInput,
    @CurrentUser() user: any,
  ): Promise<CV> {
    return this.cvService.update(cvId, user.userId, updateCVInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCV(
    @Args('cvId', { type: () => Int }) cvId: number,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.cvService.remove(cvId, user.userId);
  }

  @Subscription(() => CV, {
    name: 'cvUpdates',
    filter: (payload, variables, context) => {
      // Only send updates for the requested CV
      return payload.cvUpdated.id === variables.cvId;
    },
  })
  @UseGuards(GqlAuthGuard)
  async cvUpdates(
    @Args('cvId', { type: () => Int }) cvId: number,
    @CurrentUser() user: any,
  ) {
    return this.cvService.getCVUpdateIterator(user.userId);
  }
}
```

### Current User Decorator (`src/common/decorators/current-user.decorator.ts`)

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
```

---

## Real-time Features

### WebSocket Subscriptions vs SSE

**Current (FastAPI)**: Server-Sent Events (SSE)
- Unidirectional (server → client)
- HTTP-based
- Simple implementation

**Target (NestJS)**: GraphQL Subscriptions over WebSocket
- Bidirectional
- Real-time protocol
- Better for GraphQL ecosystem

### Subscription Example

#### Client-side (Frontend)

```typescript
import { gql } from '@apollo/client';

const CV_UPDATES_SUBSCRIPTION = gql`
  subscription OnCVUpdate($cvId: Int!) {
    cvUpdates(cvId: $cvId) {
      id
      fullName
      email
      summary
      updatedAt
    }
  }
`;

// Usage in React/Vue component
const { data, loading } = useSubscription(CV_UPDATES_SUBSCRIPTION, {
  variables: { cvId: 1 },
});
```

---

## API Endpoints Reference

### GraphQL Queries

```graphql
# Get current user
query Me {
  me {
    id
    username
  }
}

# Get all user's CVs
query MyCVs {
  myCvs {
    id
    fullName
    email
    createdAt
    updatedAt
  }
}

# Get specific CV
query GetCV($cvId: Int!) {
  cv(cvId: $cvId) {
    id
    fullName
    email
    phone
    summary
    experience {
      company
      position
      startDate
      endDate
    }
    education {
      institution
      degree
      fieldOfStudy
    }
    skills
  }
}
```

### GraphQL Mutations

```graphql
# Signup
mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    id
    username
  }
}

# Login
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    tokenType
  }
}

# Create CV
mutation CreateCV($input: CreateCVInput!) {
  createCV(input: $input) {
    id
    fullName
    email
  }
}

# Update CV
mutation UpdateCV($cvId: Int!, $input: UpdateCVInput!) {
  updateCV(cvId: $cvId, input: $input) {
    id
    fullName
    updatedAt
  }
}

# Delete CV
mutation DeleteCV($cvId: Int!) {
  deleteCV(cvId: $cvId)
}
```

### GraphQL Subscriptions

```graphql
# Subscribe to CV updates
subscription OnCVUpdate($cvId: Int!) {
  cvUpdates(cvId: $cvId) {
    id
    fullName
    email
    summary
    updatedAt
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// cv.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CVService } from './cv.service';
import { CV } from './entities/cv.entity';

describe('CVService', () => {
  let service: CVService;
  
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CVService,
        {
          provide: getRepositoryToken(CV),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CVService>(CVService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests...
});
```

### Integration Tests

```typescript
// cv.resolver.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CVResolver } from './cv.resolver';
import { CVService } from './cv.service';

describe('CVResolver', () => {
  let resolver: CVResolver;
  let service: CVService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CVResolver,
        {
          provide: CVService,
          useValue: {
            create: jest.fn(),
            findAllByUser: jest.fn(),
            // Mock other methods...
          },
        },
      ],
    }).compile();

    resolver = module.get<CVResolver>(CVResolver);
    service = module.get<CVService>(CVService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  // Add more tests...
});
```

---

## Deployment Considerations

### Environment Configuration

Production `.env`:
```env
NODE_ENV=production
PORT=8003
DATABASE_HOST=production-db-host
DATABASE_PORT=5432
DATABASE_USER=prod_user
DATABASE_PASSWORD=strong_password
DATABASE_NAME=rolekits_prod
JWT_SECRET=very-strong-secret-key-change-this
JWT_EXPIRATION=30m
```

### Production Checklist

- [ ] Disable TypeORM `synchronize` (use migrations instead)
- [ ] Set up proper database migrations
- [ ] Configure CORS for specific origins
- [ ] Set up rate limiting
- [ ] Enable HTTPS
- [ ] Set up logging (Winston or similar)
- [ ] Configure health checks
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure Docker for deployment
- [ ] Set up CI/CD pipeline

### Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8003

CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8003:8003"
    environment:
      - DATABASE_HOST=db
      - DATABASE_PORT=5432
      - DATABASE_USER=postgres
      - DATABASE_PASSWORD=postgres
      - DATABASE_NAME=rolekits
      - JWT_SECRET=your-secret-key
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=rolekits
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Migration Checklist

### Phase 1: Setup
- [ ] Initialize NestJS project
- [ ] Install all dependencies
- [ ] Configure environment variables
- [ ] Set up database connection

### Phase 2: Database Layer
- [ ] Create TypeORM entities (User, CV)
- [ ] Configure database migrations
- [ ] Test database connectivity
- [ ] Migrate data from old database

### Phase 3: Authentication
- [ ] Implement JWT strategy
- [ ] Create auth service
- [ ] Create auth resolver
- [ ] Implement guards and decorators
- [ ] Test authentication flow

### Phase 4: Business Logic
- [ ] Implement user service
- [ ] Implement CV service
- [ ] Create DTOs and inputs
- [ ] Add validation rules

### Phase 5: GraphQL Layer
- [ ] Configure Apollo Server
- [ ] Create resolvers (Auth, User, CV)
- [ ] Implement queries
- [ ] Implement mutations
- [ ] Implement subscriptions

### Phase 6: Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test GraphQL endpoints
- [ ] Load testing

### Phase 7: Deployment
- [ ] Configure production environment
- [ ] Set up Docker containers
- [ ] Configure CI/CD
- [ ] Deploy to staging
- [ ] Deploy to production

---

## Additional Resources

### Documentation
- [NestJS Official Docs](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Apollo GraphQL Docs](https://www.apollographql.com/docs/)
- [GraphQL Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/)

### Tutorials
- [NestJS GraphQL Tutorial](https://docs.nestjs.com/graphql/quick-start)
- [TypeORM with NestJS](https://docs.nestjs.com/techniques/database)
- [JWT Authentication in NestJS](https://docs.nestjs.com/security/authentication)

### Best Practices
- Use DTOs for validation
- Implement proper error handling
- Use guards for authorization
- Write comprehensive tests
- Document GraphQL schema
- Use environment variables for configuration
- Implement logging and monitoring

---

## Support & Questions

For questions or issues during migration, please:
1. Check the official documentation
2. Review existing examples in the codebase
3. Consult with the team lead
4. Create detailed issue reports

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Maintained By**: Backend Development Team
