import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthService } from 'src/shared/services/jwt-auth.service';
import { JwtService } from '@nestjs/jwt';
import { InvoicesController } from './invoices.controller';
import { Invoices, InvoicesSchema } from './invoices.entity';
import { InvoicesService } from './invoices.service';
import { User, UserSchema } from 'src/auth/auth.entity';


@Module({
  imports: [MongooseModule.forFeature([
    {name: User.name, schema: UserSchema },
    { name: Invoices.name, schema: InvoicesSchema }, 
  ])],
  controllers: [InvoicesController],
  providers: [InvoicesService, JwtAuthService, JwtService],
})
export class InvoicesModule {}