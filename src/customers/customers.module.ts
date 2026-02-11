import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customers, CustomersSchema } from './customers.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthService } from 'src/shared/services/jwt-auth.service';
import { JwtService } from '@nestjs/jwt';
import { Invoices, InvoicesSchema } from 'src/invoices/invoices.entity';


@Module({
  imports: [MongooseModule.forFeature([
    { name: Customers.name, schema: CustomersSchema }, 
    {
      name: Invoices.name, schema: InvoicesSchema
    }
  ])],
  controllers: [CustomersController],
  providers: [CustomersService, JwtAuthService, JwtService],
})
export class CustomersModule {}