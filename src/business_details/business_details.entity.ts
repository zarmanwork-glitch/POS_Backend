import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/auth.entity';
import { EnumIdentificationType } from 'src/shared/enums';
import { applyIdVirtual } from 'src/shared/utils/genericFunctions';


@Schema({
  collection: 'business_details',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class BusinessDetails {
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
    name: string;


    @Prop({ 
      type: String, 
      required: true 
    })
    companyName: string;


    @Prop({ 
      type: String, 
      required: true, 
      unique: true 
    })
    email: string;


    
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
    type: Boolean, 
    default: true, 
    required: true 
  })
  isVatRegistered: boolean;


  @Prop({ 
    type: String,
    required: false 
  })
  logoUrl?: string;


 
  @Prop({ 
    type: String,
    required: false
  })
  addressStreet?: string;

  
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
  additionalNumber?: string;


  @Prop({ 
    type: String,
    required: false
  })
  addressLocal?: string;



  @Prop({ 
    type: String, 
    required: true,
    unique: true
  })
  companyRegistrationNumber: string;


  @Prop({ 
    type: String,
    required: true
  })
  vatNumber: string;


  @Prop({ 
    type: String,
    required: false
  })
  groupVatNumber?: string;


  @Prop({
     type: String, 
     enum: Object.values(EnumIdentificationType), 
     required: true 
  })
  identificationType: EnumIdentificationType;


  @Prop({ 
    type: String, 
    required: true 
  })
  identificationNumber: string;


  @Prop({ 
    type: String,
    required: false 
  })
  refundPolicy?: string;


  @Prop({ 
      type: String,
      required: false 
  })
  refundPolicyLocal?: string;
  

  @Prop({ 
    default: false 
  })
  isDeleted?: boolean;

}

export type BusinessDetailsDocument = BusinessDetails & Document;
export const BusinessDetailsSchema = SchemaFactory.createForClass(BusinessDetails);

applyIdVirtual(BusinessDetailsSchema);