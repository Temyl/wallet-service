import { IsString, IsArray, IsEnum } from 'class-validator';
import { ApiKeyExpiry } from 'src/shared/enums';


export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsArray()
  permissions: string[];

  @IsEnum(ApiKeyExpiry)
  expiry: ApiKeyExpiry;
}
