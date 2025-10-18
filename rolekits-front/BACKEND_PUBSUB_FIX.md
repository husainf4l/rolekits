# Backend Fix: Enable Real-Time CV Updates

## Problem
WebSocket subscription connects successfully, but updates only appear after page refresh. The backend is not publishing updates to subscribers.

## Solution
Add `pubSub.publish()` calls whenever a CV is updated.

---

## Step 1: Install Dependencies

```bash
npm install graphql-subscriptions
```

---

## Step 2: Create or Update CV Resolver

### Option A: Publish in Resolver (Recommended)

**File: `src/cv/cv.resolver.ts`**

```typescript
import { Resolver, Mutation, Args, Subscription, Query } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CV } from './entities/cv.entity';
import { UpdateCVInput } from './dto/update-cv.input';
import { CVService } from './cv.service';

// Create a single PubSub instance for the module
const pubSub = new PubSub();

@Resolver(() => CV)
export class CVResolver {
  constructor(private readonly cvService: CVService) {}

  @Query(() => CV)
  @UseGuards(JwtAuthGuard)
  async cv(@Args('cvId') cvId: string): Promise<CV> {
    return this.cvService.findOne(cvId);
  }

  @Mutation(() => CV)
  @UseGuards(JwtAuthGuard)
  async updateCV(
    @Args('cvId') cvId: string,
    @Args('input') input: UpdateCVInput,
  ): Promise<CV> {
    // Update the CV in database
    const updatedCV = await this.cvService.update(cvId, input);
    
    // 🔥 CRITICAL: Publish to all subscribers
    await pubSub.publish('cvUpdates', {
      cvUpdates: updatedCV, // Must match the subscription field name
    });
    
    console.log('📤 Published CV update for:', cvId, updatedCV.fullName);
    
    return updatedCV;
  }

  @Mutation(() => CV)
  @UseGuards(JwtAuthGuard)
  async createCV(@Args('input') input: any): Promise<CV> {
    const newCV = await this.cvService.create(input);
    
    // Also publish on create if needed
    await pubSub.publish('cvUpdates', {
      cvUpdates: newCV,
    });
    
    return newCV;
  }

  @Subscription(() => CV, {
    name: 'cvUpdates',
    filter: (payload, variables) => {
      // Only send updates for the specific CV being watched
      const match = payload.cvUpdates.id === variables.cvId;
      console.log(`🔍 Filter check: ${payload.cvUpdates.id} === ${variables.cvId} = ${match}`);
      return match;
    },
  })
  @UseGuards(JwtAuthGuard)
  cvUpdates(@Args('cvId') cvId: string) {
    console.log('📡 Client subscribed to CV updates for:', cvId);
    return pubSub.asyncIterator('cvUpdates');
  }
}
```

---

### Option B: Publish in Service

**File: `src/cv/cv.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import { CV } from './entities/cv.entity';
import { UpdateCVInput } from './dto/update-cv.input';

// Export pubSub to be used in resolver
export const pubSub = new PubSub();

@Injectable()
export class CVService {
  constructor(
    @InjectRepository(CV)
    private cvRepository: Repository<CV>,
  ) {}

  async findOne(cvId: string): Promise<CV> {
    return this.cvRepository.findOne({ where: { id: cvId } });
  }

  async update(cvId: string, updateData: UpdateCVInput): Promise<CV> {
    // Update in database
    await this.cvRepository.update(cvId, updateData);
    
    // Fetch the updated CV
    const updatedCV = await this.cvRepository.findOne({ 
      where: { id: cvId },
      relations: ['experience', 'education', 'skills', 'projects'] // Include all relations
    });
    
    // 🔥 Publish the update
    await pubSub.publish('cvUpdates', {
      cvUpdates: updatedCV,
    });
    
    console.log('📤 Published update for CV:', cvId, updatedCV.fullName);
    
    return updatedCV;
  }

  async create(createData: any): Promise<CV> {
    const newCV = this.cvRepository.create(createData);
    const savedCV = await this.cvRepository.save(newCV);
    
    // Publish on create too
    await pubSub.publish('cvUpdates', {
      cvUpdates: savedCV,
    });
    
    return savedCV;
  }
}
```

**Then in resolver:**

```typescript
import { pubSub } from './cv.service';

@Resolver(() => CV)
export class CVResolver {
  
  @Subscription(() => CV, {
    filter: (payload, variables) => {
      return payload.cvUpdates.id === variables.cvId;
    },
  })
  cvUpdates(@Args('cvId') cvId: string) {
    console.log('📡 Subscription started for CV:', cvId);
    return pubSub.asyncIterator('cvUpdates');
  }
}
```

---

## Step 3: Verify GraphQL Schema

Your GraphQL schema should have:

```graphql
type Subscription {
  cvUpdates(cvId: String!): CV!
}

type Mutation {
  updateCV(cvId: String!, input: UpdateCVInput!): CV!
  createCV(input: CreateCVInput!): CV!
}

type CV {
  id: ID!
  fullName: String
  email: String
  phone: String
  summary: String
  experience: [Experience!]
  education: [Education!]
  skills: [Skill!]
  projects: [Project!]
  # ... other fields
}
```

---

## Step 4: Test the Implementation

### 1. Start Backend
```bash
npm run start:dev
```

### 2. Open Frontend
Navigate to: `http://localhost:3001/cv/[your-cv-id]`

### 3. Check Browser Console
You should see:
```
🔗 WebSocket connected
📡 Setting up subscription for CV: [cv-id]
```

### 4. Update CV in Postman

**Mutation:**
```graphql
mutation UpdateCV {
  updateCV(
    cvId: "c6ff9340-7d3f-474f-b647-e1a28cf0cd63"
    input: {
      fullName: "Real-Time Update Test"
      email: "realtime@example.com"
      summary: "This should update instantly!"
    }
  ) {
    id
    fullName
    email
    summary
  }
}
```

**Headers:**
```
Authorization: Bearer [your-jwt-token]
Content-Type: application/json
```

### 5. Expected Results

**Backend Logs:**
```
📤 Published CV update for: c6ff9340-7d3f-474f-b647-e1a28cf0cd63 Real-Time Update Test
🔍 Filter check: c6ff9340-7d3f-474f-b647-e1a28cf0cd63 === c6ff9340-7d3f-474f-b647-e1a28cf0cd63 = true
```

**Browser Console:**
```
✅ Received CV update: {id: "c6ff9340-...", fullName: "Real-Time Update Test", ...}
```

**Browser UI:**
The CV should update **instantly without refresh**! ✨

---

## Common Issues

### Issue 1: Updates not received
**Solution:** Make sure the payload key matches the subscription name:
```typescript
await pubSub.publish('cvUpdates', {
  cvUpdates: updatedCV, // ← Key must match subscription name
});
```

### Issue 2: Filter not working
**Solution:** Ensure CV IDs match exactly (check for UUID format):
```typescript
filter: (payload, variables) => {
  console.log('Comparing:', payload.cvUpdates.id, 'with', variables.cvId);
  return payload.cvUpdates.id === variables.cvId;
}
```

### Issue 3: Multiple subscriptions firing
**Solution:** Use filter to send updates only to relevant subscribers.

### Issue 4: "Cannot read properties of undefined"
**Solution:** Ensure the CV object has all required fields and relations loaded:
```typescript
const updatedCV = await this.cvRepository.findOne({ 
  where: { id: cvId },
  relations: ['experience', 'education', 'skills'] // Load all relations
});
```

---

## Production Considerations

### Use Redis for Scaling

For production with multiple server instances, use Redis PubSub:

```bash
npm install graphql-redis-subscriptions ioredis
```

```typescript
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const options = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

const pubSub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});
```

---

## Summary

✅ Install `graphql-subscriptions`  
✅ Create PubSub instance  
✅ Call `pubSub.publish()` in update mutations  
✅ Add filter to subscription resolver  
✅ Test with Postman mutation  
✅ Verify real-time updates in browser  

**The frontend is ready - you just need to add `pubSub.publish()` in your backend!**
