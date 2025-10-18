import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ApiKeyService } from '../services/api-key.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Resolver()
export class SystemResolver {
  constructor(
    private apiKeyService: ApiKeyService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Mutation(() => String, { 
    description: 'Generate a new system API key. Returns the plain key - save it securely!' 
  })
  async generateSystemApiKey(
    @Args('secretCode', { description: 'Secret code to authorize system key generation' }) 
    secretCode: string,
  ): Promise<string> {
    // Simple secret validation - you can change this
    const expectedSecret = process.env.SYSTEM_SECRET || 'changeme123';
    
    if (secretCode !== expectedSecret) {
      throw new Error('Invalid secret code');
    }

    // Get or create system user
    let systemUser = await this.userRepository.findOne({
      where: { username: 'system' },
    });

    if (!systemUser) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      systemUser = this.userRepository.create({
        username: 'system',
        hashedPassword,
      });
      
      systemUser = await this.userRepository.save(systemUser);
    }

    // Create new API key
    const result = await this.apiKeyService.createApiKey(
      systemUser.id,
      `System Master Key - ${new Date().toISOString()}`,
      undefined, // No expiration
    );

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔐 NEW SYSTEM API KEY GENERATED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`API Key: ${result.key}`);
    console.log('');
    console.log('⚠️  Save this key securely - it won\'t be shown again!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    return result.key;
  }
}
