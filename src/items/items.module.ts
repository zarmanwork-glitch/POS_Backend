import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Items, ItemsSchema } from './items.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthService } from 'src/shared/services/jwt-auth.service';
import { JwtService } from '@nestjs/jwt';



@Module({
  imports: [MongooseModule.forFeature([{ name: Items.name, schema: ItemsSchema }])],
  controllers: [ItemsController],
  providers: [ItemsService, JwtAuthService, JwtService],
})
export class ItemsModule {}