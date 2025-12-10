import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from 'src/entities/api-key.entity';
import { User } from 'src/entities/user.entity';
import { ApiKeyExpiry } from 'src/shared/enums';
import { getExpiryTimestamp } from 'src/shared/utils/api-key-expiry-utils';
import { genApiKeyNano } from 'src/shared/utils/api-key-utils';
import { hashKey, verifyHash } from 'src/shared/utils/bcrypt-utils';
import { MoreThan, Repository } from 'typeorm';


@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey) private apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(
    ownerId: string, 
    name: string, 
    permissions: string[], 
    expirySpec: ApiKeyExpiry
) {
    const owner = await this.userRepo.findOne({ where: { id: ownerId } });
    if (!owner) 
        throw new BadRequestException(
        'Owner not found'
    );

    const activeKeys = await this.apiKeyRepo.find({
    where: [
        { 
            owner: { id: ownerId }, 
            revoked: false, 
            expiresAt: MoreThan(new Date()) 
        },
    ],
    });


    if ( activeKeys.length >= 5) 
        throw new BadRequestException(
            'Max 5 active API keys allowed'
        );

    const raw = genApiKeyNano(32)
    const hash = await hashKey(raw, 10);
    const expiresAt = getExpiryTimestamp(expirySpec);

    const key = this.apiKeyRepo.create({
      owner,
      name,
      keyHash: hash,
      permissions,
      expiresAt,
      revoked: false,
    });
    await this.apiKeyRepo.save(key);

    return { api_key: raw, expires_at: key.expiresAt, id: key.id };
  }

  async findByRaw(raw: string) {
    const keys = await this.apiKeyRepo.find({ where: { revoked: false } });
    for (const k of keys) {
      const ok = await verifyHash(raw, k.keyHash);
      if (ok) return k;
    }
    return null;
  }

  async rollover(
    ownerId: string, 
    expiredKeyId: string, 
    expirySpec: ApiKeyExpiry
  ) {
    const old = await this.apiKeyRepo.findOne({ where: { id: expiredKeyId }, relations: ['owner'] });
    if (!old) throw new BadRequestException('Old key not found');
    if (old.owner.id !== ownerId) throw new BadRequestException('Not owner');
    if (!old.expiresAt || new Date(old.expiresAt) > new Date()) throw new BadRequestException('Key not expired');

    const active = await this.apiKeyRepo.find({ 
        where: { owner: { id: ownerId }, 
        revoked: false,
        expiresAt: MoreThan(new Date()) 
    }});
    if (active.length >= 5) throw new BadRequestException(
      'Max 5 active API keys allowed'
    );

    const raw = genApiKeyNano(32);
    const hash = await hashKey(raw, 10);
    const expiresAt = getExpiryTimestamp(expirySpec);

    const key = this.apiKeyRepo.create({
      owner: old.owner,
      name: old.name + '-rollover',
      keyHash: hash,
      permissions: old.permissions,
      expiresAt,
      revoked: false,
    });
    await this.apiKeyRepo.save(key);
    return { 
      api_key: raw, 
      expires_at: key.expiresAt, 
      id: key.id 
    };
  }

  async revoke(ownerId: string, keyId: string) {
    const key = await this.apiKeyRepo.findOne({ where: { id: keyId }, relations: ['owner'] });
    if (!key) throw new BadRequestException(
      'Key not found'
    );
    if (key.owner.id !== ownerId) throw new BadRequestException(
      'Not owner'
    );
    key.revoked = true;
    await this.apiKeyRepo.save(key);
    return { revoked: true };
  }
}
