import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { SignOptions } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { UserService } from 'src/user/user.service';

import { Token } from './token.model';

import { TokenDto } from './dto/token.dto';
import { SignDto } from './dto/sign.dto';
import { UserTokenDto } from './dto/user-token.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { IValidateSign } from './interfaces/validate.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectModel(Token)
    private readonly tokenModel: typeof Token,
  ) {}

  validateSignAttr({ email, phone }: IValidateSign) {
    if (!email && !phone) {
      throw new HttpException('No login details', HttpStatus.BAD_REQUEST);
    }

    return;
  }

  async signUp(createUserDto: SignDto): Promise<TokenDto> {
    this.validateSignAttr(createUserDto);

    const user = await this.userService.create(createUserDto);

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
    };
    return this.rebuildToken(tokenPayload);
  }

  async signIn({ password, ...signIn }: SignDto): Promise<TokenDto> {
    this.validateSignAttr(signIn);

    const user = await this.userService.getUser(signIn);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    if (user) {
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        phone: user.phone,
      };
      return this.rebuildToken(tokenPayload);
    }
    throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
  }

  async resetPassword(resetPasswordData: SignDto): Promise<TokenDto> {
    const [n, users] = await this.userService.updatePassword(resetPasswordData);
    const tokenPayload = {
      userId: users[0].id,
      email: users[0].email,
      phone: users[0].phone,
    };
    return this.rebuildToken(tokenPayload);
  }

  private async generateToken(data, options?: SignOptions): Promise<string> {
    return this.jwtService.sign(data, options);
  }

  private async buildToken(payload, expire, userId?: number) {
    const token = await this.generateToken(payload, {
      expiresIn: `${expire}d`,
    });

    await this.saveToken({
      token,
      userId,
    });

    return token;
  }

  async rebuildToken({ userId, email, phone }: TokenPayloadDto) {
    await this.tokenModel.destroy({ where: { userId } });

    const access_token = await this.buildToken({ userId, email, phone }, 1);
    const refresh_token = await this.buildToken(
      { refreshId: uuid() },
      2,
      userId,
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const data = this.jwtService.verify(token);
      const tokenExists = await this.tokenModel.findOne({ where: { token } });

      if (tokenExists) {
        return data;
      }
      throw new UnauthorizedException();
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async getUserIdByRefreshToken(token: string) {
    return (await this.tokenModel.findOne({ where: { token } })).userId;
  }

  private async saveToken(userTokenData: UserTokenDto) {
    const userToken = await this.tokenModel.create(userTokenData);

    return userToken;
  }
}
