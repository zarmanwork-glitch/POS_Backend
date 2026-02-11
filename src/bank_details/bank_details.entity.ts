import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/auth.entity';
import { applyIdVirtual } from 'src/shared/utils/genericFunctions';


@Schema({
  collection: 'bank_details',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class BankDetails {

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user_id: Types.ObjectId | string;


  @Prop({ 
    type: String, 
    required: true, 
    default: 'Saudi Arabia' 
  })
  country: string;

  
  @Prop({ 
    type: String, 
    required: true,
    unique: true  
  })
  accountNumber: string;


  @Prop({ 
    type: String, 
    required: true, 
    unique: true 
  })
  iban: string;

  
  @Prop({ 
    type: String, 
    required: true 
  })
  bankName: string;



  @Prop({ 
    type: String, 
    required: true 
  })
  swiftCode: string;



  @Prop({ 
    type: String, 
    required: false 
  })
  beneficiaryName?: string;

  
  @Prop({ 
    default: false 
  })
  isDeleted?: boolean;

}


export type BankDetailsDocument = BankDetails & Document;
export const BankDetailsSchema = SchemaFactory.createForClass(BankDetails);


applyIdVirtual(BankDetailsSchema);
