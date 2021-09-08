import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignDto } from './dto/sign.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    const { userId } = await this.authService.verifyToken(refreshToken);

    return this.authService.rebuildToken({ userId });
  }

  @Post('/signIn')
  signIn(@Body() signInData: SignDto) {
    return this.authService.signIn(signInData);
  }

  @Post('/signUp')
  async signUp(@Body() signUpData: SignDto) {
    return this.authService.signUp(signUpData);
  }

  @Post('/resetPassword')
  async resetPassword(@Body() resetPasswordData: SignDto) {
    return this.authService.resetPassword(resetPasswordData);
  }
}
