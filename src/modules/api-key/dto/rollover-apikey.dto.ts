import { IsString, IsIn, IsEnum } from 'class-validator';
import { ApiKey } from 'src/entities/api-key.entity';
import { ApiKeyExpiry } from 'src/shared/enums';

export class RolloverApiKeyDto {
    @IsString()
    expired_key_id: string;

    @IsEnum(ApiKeyExpiry)
    expiry: ApiKeyExpiry;
}
