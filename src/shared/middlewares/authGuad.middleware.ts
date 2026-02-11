import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { callHTTPException } from '../exceptions';
import { Env } from '../config';
import { Model, Document } from 'mongoose';
import { User } from '../../auth/auth.entity';
import { TokenExpiredError } from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User & Document>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
          const [type, token] = req.headers.authorization?.split(' ') ?? [];
          if (type !== 'Bearer' || !token) {
            return callHTTPException('UnauthorizedException');
          }

          const userData: any = await this.jwtService.verifyAsync(token, 
            { secret: Env.jwt_secret }
          );

          
          (req as any).user = { id: userData['id'] };

          
          if (!userData) {
            return callHTTPException('UnauthorizedException');
          }

          const isUserExist = await this.userModel.findOne(
            { _id: userData['id'] }
          ).exec();

          if (!isUserExist) {
            return callHTTPException('UnauthorizedException');
          }

          if (isUserExist.isDeleted) {
            return callHTTPException('Your Account is Blocked');
          }

          return next();
    } 
    catch (err: any) {
        if (err instanceof TokenExpiredError) {
          return callHTTPException('UnauthorizedException');
        }
        return callHTTPException(err?.message || 'UnauthorizedException');
    }
  }
}
