import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { RolloverApiKeyDto } from './dto/rollover-apikey.dto';
import { JwtOrApiGuard } from 'src/guards/api-jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from 'src/entities/api-key.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { getExpiryTimestamp } from 'src/shared/utils/api-key-expiry-utils';

// Swagger imports
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiBody 
} from '@nestjs/swagger';


@ApiTags('API Keys')
@ApiBearerAuth() // shows "Authorize" button in swagger
@Controller('keys')
@UseGuards(JwtOrApiGuard)
export class ApiKeyController {
  constructor(
    @InjectRepository(ApiKey) private readonly apikeyRepo: Repository<ApiKey>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly apikeyService: ApiKeyService,
  ) {}

  // ---------------------------
  // CREATE NEW API KEY
  // ---------------------------
  @Post('create')
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiResponse({ status: 201, description: 'API key successfully created' })
  async create(@Req() req, @Body() payload: CreateApiKeyDto) {
    const user = req.user;

    if (!user?.id) throw new Error('Only users may create API keys');

    return this.apikeyService.create(
      user.id,
      payload.name,
      payload.permissions,
      payload.expiry,
    );
  }

  // ---------------------------
  // ROLLOVER API KEY
  // ---------------------------
  @Post('rollover')
  @ApiOperation({ summary: 'Rollover (regenerate) an expired API key' })
  @ApiBody({ type: RolloverApiKeyDto })
  @ApiResponse({ status: 200, description: 'API key rolled over successfully' })
  async rollover(@Req() req, @Body() payload: RolloverApiKeyDto) {
    const user = req.user;

    if (!user?.id) throw new Error('Only users may rollover');

    return this.apikeyService.rollover(
      user.id,
      payload.expired_key_id,
      payload.expiry,
    );
  }

  // ---------------------------
  // REVOKE API KEY
  // ---------------------------
  @Post('revoke')
  @ApiOperation({ summary: 'Revoke an existing API key' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key_id: { type: 'string' },
      },
      required: ['key_id'],
    },
  })
  @ApiResponse({ status: 200, description: 'API key revoked successfully' })
  async revoke(@Req() req, @Body() body: { key_id: string }) {
    const user = req.user;

    if (!user?.id) throw new Error('Only users may revoke keys');

    return this.apikeyService.revoke(user.id, body.key_id);
  }
}
