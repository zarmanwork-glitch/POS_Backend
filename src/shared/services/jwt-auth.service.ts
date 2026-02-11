import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Env } from '../config';

@Injectable()
export class JwtAuthService {
  constructor( private readonly jwtService: JwtService) {}

  async generateToken(user): Promise<string> {
    const payload = {
      id: user.id,      
      email: user.email,
    };
    const options = {
     secret: Env.jwt_secret
    };

    return this.jwtService.sign(payload, options);
  }

  async getUserFromToken(
    token: string,
  ): Promise<any> {
    return this.jwtService.decode(token);
  }
}
