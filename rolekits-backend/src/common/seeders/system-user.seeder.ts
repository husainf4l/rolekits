import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiKey } from '../../auth/entities/api-key.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class SystemUserSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async onModuleInit() {
    await this.seedSystemUser();
  }

  private async seedSystemUser() {
    const systemUsername = 'system';
    
    // Check if system user already exists
    let systemUser = await this.userRepository.findOne({
      where: { username: systemUsername },
    });

    if (!systemUser) {
      console.log('🔧 Creating system user...');
      
      // Create system user with a random password (won't be used)
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      systemUser = this.userRepository.create({
        username: systemUsername,
        hashedPassword,
      });

      systemUser = await this.userRepository.save(systemUser);
      console.log('✅ System user created:', systemUser.id);
    }

    // Check if system API key already exists
    const existingKey = await this.apiKeyRepository.findOne({
      where: { 
        userId: systemUser.id,
        name: 'System Master Key',
        active: true,
      },
    });

    if (!existingKey) {
      console.log('🔑 Creating system API key...');
      
      // Generate a system API key with consistent format
      const randomPart = crypto.randomBytes(32).toString('hex');
      const systemKey = `rk_system_${randomPart}`;
      const hashedKey = crypto.createHash('sha256').update(systemKey).digest('hex');

      const apiKey = this.apiKeyRepository.create({
        key: hashedKey,
        name: 'System Master Key',
        userId: systemUser.id,
        active: true,
        // No expiration for system key
        expiresAt: undefined,
      });

      await this.apiKeyRepository.save(apiKey);

      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔐 SYSTEM API KEY (Save this securely!)');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log(`API Key: ${systemKey}`);
      console.log('');
      console.log('This key has full system access. Use it for:');
      console.log('  • Admin operations');
      console.log('  • Background jobs');
      console.log('  • System integrations');
      console.log('  • Emergency access');
      console.log('');
      console.log('⚠️  This key will NOT be shown again!');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
    } else {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('✅ System user exists');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Username: ${systemUsername}`);
      console.log(`User ID: ${systemUser.id}`);
      console.log(`API Key ID: ${existingKey.id}`);
      console.log(`API Key Name: ${existingKey.name}`);
      console.log(`Created: ${existingKey.createdAt}`);
      console.log('');
      console.log('💡 To create a new system key, delete this one first or');
      console.log('   create additional keys via GraphQL mutation.');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
    }
  }
}
