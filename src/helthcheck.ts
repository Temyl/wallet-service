import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('kaithheathcheck')
  health() {
    return { status: 'ok' };
  }
}
