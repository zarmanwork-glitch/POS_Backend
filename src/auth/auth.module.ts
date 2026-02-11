import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import {AuthService} from './auth.service';
import { User, UserSchema } from './auth.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthService } from '../shared/services/jwt-auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthService, JwtService],
})
export class AuthModule {}