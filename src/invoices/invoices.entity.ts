import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/auth.entity';
import { applyIdVirtual } from 'src/shared/utils/genericFunctions';
import { EnumIncoTerms, EnumUnitOfMeasure } from 'src/shared/enums';



@Schema({
  collection: 'invoices',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Invoices {
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
  invoiceNumber: string; 



  @Prop({
       type: String, 
       enum: Object.values(EnumIncoTerms), 
       required: true 
  })
  incoterms: EnumIncoTerms;



   @Prop({ 
    type: String,
    required: false 
  })
  location?: string;


  @Prop({ 
    type: Date, 
    required: true 
  })
  invoiceDate: Date;


  @Prop({ 
    type: Date, 
    required: true 
  })
  dueDate: Date;


  
  @Prop({ 
    type: String,
    required: false 
  })
  logo?: string;

  
  @Prop({ 
    type: Date,
    required: false 
  })
  supplyDate?: Date;


  @Prop({ 
    type: Date,
    required: false 
  })
  supplyEndDate?: Date;


  @Prop({ 
    type: String,
    required: false 
  })
  contractId?: string;


  @Prop({ 
    type: String,
    required: false 
  })
  customerPoNumber?: string;


  @Prop({ 
    type: String,
    required: false 
  })
  paymentTerms?: string;


  @Prop({ 
    type: String, 
    required: true 
  })
  paymentMeans: string;
 

  @Prop({ 
    type: String,
    required: false 
  })
  specialTaxTreatment?: string;



  @Prop({ 
    type: Boolean, 
    default: false 
  })
  prePaymentInvoice?: boolean;



  @Prop({ type: Types.ObjectId, ref: 'BusinessDetails', required: true })
  business_detail: Types.ObjectId;


  @Prop({ type: Types.ObjectId, ref: 'Customers', required: true })
  customer: Types.ObjectId;


  @Prop({ type: String, ref: 'BankDetails', required: true })
  bank_detail: string;


  @Prop({
  type: [
      {
        no: { 
            type: Number, 
            required: true 
        },
        description: { 
            type: String, 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true 
        },
        unitRate: { 
            type: Number, 
            required: true 
        },
        discountType: { 
            type: String,
            required: true
        },
        discount: { 
            type: Number, 
            required: false
        },
        taxRate: { 
            type: Number, 
            required: true 
        },
        taxCode: { 
            type: String, 
            required: true
        },
        vatExemptionReason:{
          type: String,
          required: false
        },
        total: { 
            type: Number, 
            required: true 
        },
        taxableAmount:{
            type: Number, 
            required: true
        },
        discountAmount: {
            type: Number, 
            required: true
        },
        vatAmount: { 
            type: Number, 
            required: true 
        },
        serviceCode: { 
            type: String, 
            required: false
        },
        unit: { 
            type: String, 
            required: true,
            enum: Object.values(EnumUnitOfMeasure), 
        },      
        reportingTags: {
          type: [String],
          default: [],
        },
      },
    ],
    required: true,
    default: [],
  })
  items: {
    no: number;
    description: string;
    quantity: number;
    unitRate: number;
    discountType: string;   
    discount?: number;
    taxRate: number;
    taxCode: string;
    vatExemptionReason?:string;
    total: number;
    taxableAmount: number;
    discountAmount: number;
    vatAmount: number;  
    serviceCode?: string;
    unit: string;
    reportingTags?: string[];
  }[];




  @Prop({ 
    type: Number,
    required: false
  })
  subTotal: number;


  @Prop({ 
      type: Number,
      required: false
  })
  totalDiscount: number;


   @Prop({ 
      type: Number,
      required: false
  })
  totalTaxableAmount: number;


  @Prop({ 
      type: Number,
      required: false
  })
  totalNonTaxableAmount: number;


   @Prop({ 
      type: Number,
      required: false
  })
  totalVat: number;



  @Prop({ 
      type: Number,
      required: false,
      validate: {
          validator: function (value: number) { return value > 0; },
          message: 'Invoice net total must be greater than 0',
      }
  })
  invoiceNetTotal: number;



  @Prop({ 
    type: String,
    required: false
 })
  totalAmountInWords?: string;


  @Prop({ 
    type: String,
    required: false 
  })    
  notes?: string;
  

  
  @Prop({ 
    type: Number,
    required: false
 })
  AmountPaidToDate?: number;



  @Prop({ 
    default: false 
  })
  isDeleted?: boolean;

}



export type InvoicesDocument = Invoices & Document;
export const InvoicesSchema = SchemaFactory.createForClass(Invoices);

export type InvoicesDocumentType = Invoices & Document;

applyIdVirtual(InvoicesSchema);