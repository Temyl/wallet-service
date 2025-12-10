import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiKeyService } from 'src/modules/api-key/api-key.service';


@Injectable()
export class JwtOrApiGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] as string | undefined;
    const apiKeyHeader = (req.headers['x-api-key'] || req.headers['x_api_key']) as string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        req.user = payload;
        return true;
      } catch (err) {
        throw new UnauthorizedException('Invalid JWT');
      }
    }

    if (apiKeyHeader) {
      const key = await this.apiKeyService.findByRaw(apiKeyHeader);
      if (!key) throw new UnauthorizedException('Invalid API key');
      if (key.revoked) throw new UnauthorizedException('API key revoked');
      if (key.expiresAt && new Date(key.expiresAt) <= new Date()) throw new UnauthorizedException('API key expired');
      req.apiKey = key;
      return true;
    }

    throw new UnauthorizedException('Missing authentication');
  }
}
