import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/auth.entity';
import { applyIdVirtual } from 'src/shared/utils/genericFunctions';


@Schema({
  collection: 'customers',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Customers {

  @Prop({
      type: Types.ObjectId,
      ref: User.name,
      required: true,
  })
  user_id: Types.ObjectId | string;


  @Prop({ 
    type: String,
    required: false 
  })
  name?: string;


  @Prop({ 
    type: String, 
    required: true 
  })
  companyName: string;


  @Prop({ 
    type: String,
    required: false
  })
  customerNumber?: string;


  @Prop({ 
    type: String, 
    required: false, 
    unique: true 
  })
  email?: string;


  
  @Prop({ 
    type: String, 
    required: true
  })
  phoneNumber: string;


  @Prop({ 
    type: String,
    required: false 
  })
  companyNameLocal?: string;


  
  @Prop({ 
    type: String,
    required: true
  })
  addressStreet: string;

  
  @Prop({ 
    type: String,
    required: false
  })
  addressStreetAdditional?: string;


  
  @Prop({ 
    type: String, 
    required: true 
  })
  buildingNumber: string;


  @Prop({ 
    type: String, 
    required: true 
  })
  country: string;




  @Prop({ 
    type: String,
    required: false 
  })
  province?: string;


  @Prop({ 
    type: String,
    required: true
  })
  city: string;


  @Prop({ 
    type: String,
    required: true
  })
  district: string;


  @Prop({ 
    type: String, 
    required: true 
  })
  postalCode: string;

  

  @Prop({ 
    type: String,
    required: false
  })
  neighborhood?: string;


  @Prop({ 
    type: String,
    required: false
  })
  addressLocal?: string;


  @Prop({
     type: String, 
     required: true 
  })
  identificationType: string;


  @Prop({ 
    type: String, 
    required: false
  })
  identificationNumber?: string;

  

  @Prop({ 
    type: String,  
    required: false
  })
  vatNumber?: string;


  @Prop({ 
    type: String,
    required: false
  })
  groupVatNumber?: string;


  
  @Prop({ 
    type: String, 
    required: false
  })
  companyRegistrationNumber?: string;


  @Prop({ 
    default: false 
  })
  isDeleted?: boolean;

}

export type CustomersDocument = Customers & Document;
export const CustomersSchema = SchemaFactory.createForClass(Customers);



applyIdVirtual(CustomersSchema);