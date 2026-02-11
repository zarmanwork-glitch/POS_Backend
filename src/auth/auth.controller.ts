import {  Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  GetObjectTemplateForAPIResponseGeneral,
  ObjectTemplateForAPIResponseGeneral,
} from 'src/shared/data_templates/ObjectTemplateForAPIResponse';
import { EnumAPIResponseStatusType } from 'src/shared/enums';
import { callHTTPException } from 'src/shared/exceptions';
import { LoginDto } from './dto/auth.dto';



@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  
  @Post('login')
  @UsePipes(ValidationPipe)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<
    | typeof ObjectTemplateForAPIResponseGeneral
    | null
  > {
    try {
          const data = await this.authService.login(loginDto);
          return GetObjectTemplateForAPIResponseGeneral(
            EnumAPIResponseStatusType.SUCCESS,
            data,
            'login_success',
          );
    } 
    catch (error) {
      callHTTPException(error.message);
    }
  }

}