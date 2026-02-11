import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/auth.entity';
import { applyIdVirtual } from 'src/shared/utils/genericFunctions';


@Schema({
  collection: 'items',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Items {
 
  @Prop({
      type: Types.ObjectId,
      ref: User.name,
      required: true,
  })
  user_id: Types.ObjectId | string;
  


  @Prop({
     type: String, 
     required: true 
  })
  itemType: string;


  @Prop({ 
    type: String, 
    required: true
  })
  itemStatus: string;


  @Prop({ 
    type: String, 
    required: true 
  })
  description: string;


  @Prop({ 
    type: String, 
    required: true, 
  })
  materialNo: string;


  @Prop({ 
    type: String, 
    required: true 
  })
  unitOfMeasure: string;

  @Prop({ 
    type: Number, 
    default: 0 
  })
  buyPrice: number;


  @Prop({
     type: Number,
      default: 0 
 })
  sellPrice: number;


  @Prop({ 
    type: Number, 
    default: 0 
  })
  discountPercentage: number;

  
  @Prop({ 
    default: false 
  })
  isDeleted?: boolean;


}

export type ItemsDocument = Items & Document;
export const ItemsSchema = SchemaFactory.createForClass(Items);

applyIdVirtual(ItemsSchema);