import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * Generate a new API key for a user
   */
  async createApiKey(userId: string, name: string, expiresInDays?: number): Promise<{ key: string; apiKey: ApiKey }> {
    // Generate a secure random key
    const key = `rk_${crypto.randomBytes(32).toString('hex')}`;
    
    // Hash the key for storage (like passwords)
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
    
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const apiKey = this.apiKeyRepository.create({
      key: hashedKey,
      name,
      userId,
      expiresAt,
      active: true,
    });

    await this.apiKeyRepository.save(apiKey);

    // Return the plain key (only time it's visible)
    return { key, apiKey };
  }

  /**
   * Validate an API key
   */
  async validateApiKey(key: string): Promise<ApiKey | null> {
    if (!key || !key.startsWith('rk_')) {
      return null;
    }

    // Hash the provided key
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');

    const apiKey = await this.apiKeyRepository.findOne({
      where: { key: hashedKey, active: true },
      relations: ['user'],
    });

    if (!apiKey) {
      return null;
    }

    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update last used timestamp
    apiKey.lastUsedAt = new Date();
    await this.apiKeyRepository.save(apiKey);

    return apiKey;
  }

  /**
   * List all API keys for a user
   */
  async findAllByUser(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Revoke (deactivate) an API key
   */
  async revokeApiKey(id: string, userId: string): Promise<boolean> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, userId },
    });

    if (!apiKey) {
      throw new UnauthorizedException('API key not found');
    }

    apiKey.active = false;
    await this.apiKeyRepository.save(apiKey);

    return true;
  }

  /**
   * Delete an API key permanently
   */
  async deleteApiKey(id: string, userId: string): Promise<boolean> {
    const result = await this.apiKeyRepository.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
