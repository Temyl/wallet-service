import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { googlePayload } from 'src/shared/interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string, 
    refreshToken: string, 
    profile: Profile, 
    done: VerifyCallback) {
    try {
         const email =
            Array.isArray(profile.emails) && profile.emails[0]?.value
                ? String(profile.emails[0].value)
                : '';
        
        const firstName = profile.name?.givenName
            ? String(profile.name.givenName)
            : '';
        const lastName = profile.name?.familyName
        ? String(profile.name.familyName)
        : '';      
        
        const full_name = `${firstName} ${lastName}`.trim();
        const payload: googlePayload = { 
            sub: profile.id, 
            email: email, 
            name: full_name 
        };
        const user = await this.authService.findOrCreateFromGoogle(payload);
        done(null, user);
        } catch (err) {
        done(err, false);
        }
  }

  
}
