import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { googlePayload } from 'src/shared/interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Initiates Google OAuth login
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth login page' })
  async googleAuth() {
   
  }

  
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback endpoint' })
  @ApiResponse({ status: 200, description: 'User successfully logged in via Google' })
  @ApiResponse({ status: 401, description: 'Unauthorized / Invalid Google payload' })
  @ApiBearerAuth() // optional, if returning JWT
  async googleAuthRedirect(@Req() req: googlePayload) {
    const user = await this.authService.findOrCreateFromGoogle(req);
    const token = await this.authService.signToken(user);
    return {
      statusCode: HttpStatus.OK,
      message: 'User logged in successfully',
      data: { user },
      access_token: token.access_token,
    };
  }
}
