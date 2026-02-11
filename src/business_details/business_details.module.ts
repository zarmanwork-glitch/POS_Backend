import { Module } from '@nestjs/common';
import { BusinessDetailsController } from './business_details.controller';
import { BusinessDetailsService } from './business_details.service';
import { BusinessDetails, BusinessDetailsSchema } from './business_details.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthService } from 'src/shared/services/jwt-auth.service';
import { JwtService } from '@nestjs/jwt';
import { Invoices, InvoicesSchema } from '../invoices/invoices.entity';


@Module({
  imports: [MongooseModule.forFeature([
     { name: BusinessDetails.name, schema: BusinessDetailsSchema },
     { name: Invoices.name, schema: InvoicesSchema }
  ])],
  controllers: [BusinessDetailsController],
  providers: [BusinessDetailsService, JwtAuthService, JwtService],
})
export class BusinessDetailsModule {}