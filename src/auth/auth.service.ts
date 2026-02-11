import { Injectable } from '@nestjs/common';
import { JwtAuthService } from 'src/shared/services/jwt-auth.service';
import { callHTTPException } from 'src/shared/exceptions';
import { LoginDto } from './dto/auth.dto';
import { User } from './auth.entity';
import * as bcrypt from 'bcrypt';
import { Model, Document } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
     @InjectModel(User.name) private readonly userModel: Model<User & Document>,
  ) {}


  
  async login(loginDto: LoginDto): Promise<any> {
    try {
          const { email, password } = loginDto;
          let user = await this.userModel.findOne(
            { email }
          ).select('+password')
          .exec();

          if (!user) {
            callHTTPException('user_not_exist');
          }

          if (user.isDeleted) {
            callHTTPException('account_blocked');
          }

          const passwordHash = await bcrypt.compare(password, user.password as string);
          if (!passwordHash) {
            callHTTPException('invalid_email_or_password');
          }

          const token = await this.jwtAuthService.generateToken(user);
          
          let userData = {
            id: user._id,
            email: user.email,
          }
          

          return { user: userData, token };
    } 
    catch (err) {
      callHTTPException(err.message);
    }
  }


}
