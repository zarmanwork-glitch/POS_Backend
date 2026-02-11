import { IsNotEmpty, IsString, IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';




export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  
  @IsNotEmpty()
  @IsString()
  password: string;
}


