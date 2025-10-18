# Implementation Checklist - NestJS Migration

## ✅ Step-by-Step Implementation Guide

This document provides a detailed, copy-paste ready implementation checklist for migrating from FastAPI to NestJS.

---

## Phase 1: Project Initialization ⚙️

### ☑️ Step 1.1: Install Dependencies (5 mins)

```bash
cd rolekits-backend

# Install all required packages
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql \
  @nestjs/typeorm typeorm pg \
  @nestjs/jwt @nestjs/passport passport passport-jwt \
  @nestjs/config bcrypt class-validator class-transformer \
  graphql-subscriptions

# Install dev dependencies
npm install -D @types/passport-jwt @types/bcrypt @types/node
```

**Verification**: Check `package.json` includes all packages

---

### ☑️ Step 1.2: Create Environment File (2 mins)

Create `.env` in project root:

```env
# Server
NODE_ENV=development
PORT=8003

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=rolekits

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRATION=30m

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Verification**: File exists and contains all variables

---

### ☑️ Step 1.3: Create .gitignore (1 min)

Add to `.gitignore`:

```
.env
.env.local
.env.*.local
dist/
node_modules/
*.log
```

---

## Phase 2: Configuration Files 📝

### ☑️ Step 2.1: Database Configuration

Create `src/config/database.config.ts`:

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
});
```

**Verification**: No TypeScript errors

---

### ☑️ Step 2.2: JWT Configuration

Create `src/config/jwt.config.ts`:

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

**Verification**: No TypeScript errors

---

## Phase 3: Common Utilities 🛠️

### ☑️ Step 3.1: Current User Decorator

Create `src/common/decorators/current-user.decorator.ts`:

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

**Verification**: No TypeScript errors

---

### ☑️ Step 3.2: GraphQL Auth Guard

Create `src/common/guards/gql-auth.guard.ts`:

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

**Verification**: No TypeScript errors

---

## Phase 4: User Module 👤

### ☑️ Step 4.1: User Entity

Create `src/users/entities/user.entity.ts`:

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CV } from '../../cv/entities/cv.entity';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ unique: true, length: 100 })
  @Field()
  username: string;

  @Column({ length: 255 })
  hashedPassword: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @OneToMany(() => CV, (cv) => cv.user, { cascade: true })
  @Field(() => [CV], { nullable: true })
  cvs?: CV[];
}
```

**Verification**: No TypeScript errors

---

### ☑️ Step 4.2: User Service

Update `src/users/users.service.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(data: { username: string; hashedPassword: string }): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

**Verification**: No TypeScript errors

---

### ☑️ Step 4.3: User Resolver

Update `src/users/users.resolver.ts`:

```typescript
import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getCurrentUser(@CurrentUser() user: any): Promise<User> {
    return this.usersService.findById(user.userId);
  }
}
```

**Verification**: No TypeScript errors

---

### ☑️ Step 4.4: User Module

Update `src/users/users.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
```

**Verification**: No TypeScript errors

---

## Phase 5: CV Module 📄

### ☑️ Step 5.1: CV Entity

Create `src/cv/entities/cv.entity.ts`:

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
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

  @Field({ nullable: true })
  expirationDate?: string;
}

@ObjectType()
export class Project {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;
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

  @ManyToOne(() => User, (user) => user.cvs, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User;

  // Personal Information
  @Column({ nullable: true, length: 255 })
  @Field({ nullable: true })
  fullName?: string;

  @Column({ nullable: true, length: 255 })
  @Field({ nullable: true })
  email?: string;

  @Column({ nullable: true, length: 50 })
  @Field({ nullable: true })
  phone?: string;

  @Column({ nullable: true, length: 500 })
  @Field({ nullable: true })
  address?: string;

  @Column({ nullable: true, length: 255 })
  @Field({ nullable: true })
  linkedin?: string;

  @Column({ nullable: true, length: 255 })
  @Field({ nullable: true })
  github?: string;

  @Column({ nullable: true, length: 255 })
  @Field({ nullable: true })
  website?: string;

  // Professional Summary
  @Column('text', { nullable: true })
  @Field({ nullable: true })
  summary?: string;

  // JSON columns
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

  // Timestamps
  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
```

**Verification**: No TypeScript errors

---

### ☑️ Step 5.2: CV DTOs

Create `src/cv/dto/create-cv.input.ts`:

```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray } from 'class-validator';

@InputType()
export class ExperienceInput {
  @Field()
  @IsString()
  company: string;

  @Field()
  @IsString()
  position: string;

  @Field()
  @IsString()
  startDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class EducationInput {
  @Field()
  @IsString()
  institution: string;

  @Field()
  @IsString()
  degree: string;

  @Field()
  @IsString()
  fieldOfStudy: string;

  @Field()
  @IsString()
  startDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string;
}

@InputType()
export class LanguageInput {
  @Field()
  @IsString()
  language: string;

  @Field()
  @IsString()
  proficiency: string;
}

@InputType()
export class CertificationInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  issuer: string;

  @Field()
  @IsString()
  date: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  expirationDate?: string;
}

@InputType()
export class ProjectInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  url?: string;
}

@InputType()
export class ReferenceInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  position: string;

  @Field()
  @IsString()
  company: string;

  @Field()
  @IsString()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;
}

@InputType()
export class CreateCVInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fullName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  github?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  summary?: string;

  @Field(() => [ExperienceInput], { nullable: true })
  @IsOptional()
  @IsArray()
  experience?: ExperienceInput[];

  @Field(() => [EducationInput], { nullable: true })
  @IsOptional()
  @IsArray()
  education?: EducationInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @Field(() => [LanguageInput], { nullable: true })
  @IsOptional()
  @IsArray()
  languages?: LanguageInput[];

  @Field(() => [CertificationInput], { nullable: true })
  @IsOptional()
  @IsArray()
  certifications?: CertificationInput[];

  @Field(() => [ProjectInput], { nullable: true })
  @IsOptional()
  @IsArray()
  projects?: ProjectInput[];

  @Field(() => [ReferenceInput], { nullable: true })
  @IsOptional()
  @IsArray()
  references?: ReferenceInput[];
}
```

Create `src/cv/dto/update-cv.input.ts`:

```typescript
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCVInput } from './create-cv.input';

@InputType()
export class UpdateCVInput extends PartialType(CreateCVInput) {}
```

**Verification**: No TypeScript errors

---

### ☑️ Step 5.3: CV Service

Create `src/cv/cv.service.ts`:

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
    
    // Publish for subscriptions
    pubSub.publish(`cvUpdated_${userId}`, { cvUpdated: savedCV });
    
    return savedCV;
  }

  async findAllByUser(userId: number): Promise<CV[]> {
    return this.cvRepository.find({
      where: { userId },
      relations: ['user'],
      order: { updatedAt: 'DESC' },
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
    
    // Publish for subscriptions
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

**Verification**: No TypeScript errors

---

### ☑️ Step 5.4: CV Resolver

Create `src/cv/cv.resolver.ts`:

```typescript
import { Resolver, Query, Mutation, Args, Int, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CVService } from './cv.service';
import { CV } from './entities/cv.entity';
import { CreateCVInput } from './dto/create-cv.input';
import { UpdateCVInput } from './dto/update-cv.input';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
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
    filter: (payload, variables) => {
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

**Verification**: No TypeScript errors

---

### ☑️ Step 5.5: CV Module

Update `src/cv/cv.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CVService } from './cv.service';
import { CVResolver } from './cv.resolver';
import { CV } from './entities/cv.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CV])],
  providers: [CVService, CVResolver],
  exports: [CVService],
})
export class CVModule {}
```

**Verification**: No TypeScript errors

---

## Phase 6: Authentication Module 🔐

### ☑️ Step 6.1: Auth DTOs

Create `src/auth/dto/login.input.ts`:

```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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

Create `src/auth/dto/signup.input.ts`:

```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
```

Create `src/auth/dto/login-response.dto.ts`:

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

**Verification**: No TypeScript errors

---

### ☑️ Step 6.2: JWT Strategy

Create `src/auth/jwt.strategy.ts`:

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

**Verification**: No TypeScript errors

---

### ☑️ Step 6.3: Auth Service

Update `src/auth/auth.service.ts`:

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
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
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

**Verification**: No TypeScript errors

---

### ☑️ Step 6.4: Auth Resolver

Update `src/auth/auth.resolver.ts`:

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

**Verification**: No TypeScript errors

---

### ☑️ Step 6.5: Auth Module

Update `src/auth/auth.module.ts`:

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

**Verification**: No TypeScript errors

---

## Phase 7: Main Application Files 🚀

### ☑️ Step 7.1: Update App Module

Update `src/app.module.ts`:

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
      envFilePath: '.env',
    }),
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
        if (req) {
          return { req };
        }
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

**Verification**: No TypeScript errors

---

### ☑️ Step 7.2: Update Main.ts

Update `src/main.ts`:

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

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 8003;
  await app.listen(port);
  
  console.log(`🚀 Server ready at: http://localhost:${port}`);
  console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
}
bootstrap();
```

**Verification**: No TypeScript errors

---

## Phase 8: Testing & Verification ✅

### ☑️ Step 8.1: Build the Project

```bash
npm run build
```

**Expected**: Build completes without errors

---

### ☑️ Step 8.2: Start Development Server

```bash
npm run start:dev
```

**Expected**: 
```
🚀 Server ready at: http://localhost:8003
📊 GraphQL Playground: http://localhost:8003/graphql
```

---

### ☑️ Step 8.3: Test Database Connection

Open: `http://localhost:8003/graphql`

Run introspection query:
```graphql
{
  __schema {
    types {
      name
    }
  }
}
```

**Expected**: Returns schema types

---

### ☑️ Step 8.4: Test Signup

```graphql
mutation {
  signup(input: {
    username: "testuser"
    password: "password123"
  }) {
    id
    username
    createdAt
  }
}
```

**Expected**: Returns user object with id

---

### ☑️ Step 8.5: Test Login

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

**Expected**: Returns JWT token

---

### ☑️ Step 8.6: Test Authenticated Query

Set HTTP Header:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

Query:
```graphql
query {
  me {
    id
    username
  }
}
```

**Expected**: Returns current user

---

### ☑️ Step 8.7: Test Create CV

```graphql
mutation {
  createCV(input: {
    fullName: "John Doe"
    email: "john@example.com"
    phone: "+1234567890"
    summary: "Experienced developer"
    skills: ["TypeScript", "NestJS", "GraphQL"]
  }) {
    id
    fullName
    email
    createdAt
  }
}
```

**Expected**: Returns created CV

---

### ☑️ Step 8.8: Test Get CVs

```graphql
query {
  myCvs {
    id
    fullName
    email
    updatedAt
  }
}
```

**Expected**: Returns list of user's CVs

---

## Completion Checklist 📋

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] All entities created
- [ ] All services implemented
- [ ] All resolvers implemented
- [ ] Authentication working
- [ ] Signup working
- [ ] Login working
- [ ] Protected queries working
- [ ] CRUD operations on CV working
- [ ] GraphQL Playground accessible
- [ ] No TypeScript errors
- [ ] No runtime errors

---

## Next Steps 🎯

1. ✅ Add comprehensive unit tests
2. ✅ Add integration tests
3. ✅ Set up database migrations (TypeORM)
4. ✅ Add input validation
5. ✅ Add error handling
6. ✅ Set up logging
7. ✅ Configure Docker
8. ✅ Set up CI/CD
9. ✅ Production deployment

---

**Document Status**: Complete  
**Last Updated**: October 16, 2025  
**Estimated Implementation Time**: 6-8 hours
