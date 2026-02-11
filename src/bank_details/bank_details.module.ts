import { Module } from '@nestjs/common';
import { BankDetailsController } from './bank_details.controller';
import { BankDetailsService } from './bank_details.service';
import { BankDetails, BankDetailsSchema } from './bank_details.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthService } from 'src/shared/services/jwt-auth.service';
import { JwtService } from '@nestjs/jwt';
import { Invoices, InvoicesSchema } from '../invoices/invoices.entity';


@Module({
  imports: [MongooseModule.forFeature([
     { name: BankDetails.name, schema: BankDetailsSchema },
     { name: Invoices.name, schema: InvoicesSchema }
  ])],
  controllers: [BankDetailsController],
  providers: [BankDetailsService, JwtAuthService, JwtService],
})
export class BankDetailsModule {}