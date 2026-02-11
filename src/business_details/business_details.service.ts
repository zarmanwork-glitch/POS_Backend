import { Injectable } from '@nestjs/common';
import { callHTTPException } from 'src/shared/exceptions';
import { CreateBusinessDetailsDto, businessDetailsByIdDto, getBusinessDetailsDto, UpdateBusinessDetailsDto } from './dto';
import { BusinessDetails } from './business_details.entity';
import { Model, Document, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { uploadToS3 } from 'src/shared/aws/s3';
import {Invoices } from '../invoices/invoices.entity';


@Injectable()
export class BusinessDetailsService {
  constructor(
      @InjectModel(BusinessDetails.name) private readonly businessDetailsModel: Model<BusinessDetails & Document>,
      @InjectModel(Invoices.name) private readonly invoiceModel: Model<Invoices & Document>,
  ) {}


  
        async addBusinessDetails(userId:string, businessDetailsDto: CreateBusinessDetailsDto, logo: any): Promise<any> {
          try {
                
                let logoUrl: string;
                if(logo){
                  logoUrl = await uploadToS3(logo);       
                }

                const newBusinessDetail = await this.businessDetailsModel.create({
                    user_id: userId,    
                    name: businessDetailsDto.name,
                    companyName: businessDetailsDto.companyName,
                    email: businessDetailsDto.email,
                    phoneNumber: businessDetailsDto.phoneNumber,
                    companyNameLocal: businessDetailsDto.companyNameLocal,
                    isVatRegistered: businessDetailsDto.isVatRegistered,
                    logoUrl,
                    addressStreet: businessDetailsDto.addressStreet,
                    addressStreetAdditional: businessDetailsDto.addressStreetAdditional,
                    buildingNumber: businessDetailsDto.buildingNumber,
                    country: businessDetailsDto.country,
                    province: businessDetailsDto.province,
                    city: businessDetailsDto.city,
                    district: businessDetailsDto.district,
                    postalCode: businessDetailsDto.postalCode,
                    additionalNumber: businessDetailsDto.additionalNumber,
                    addressLocal: businessDetailsDto.addressLocal,
                    companyRegistrationNumber: businessDetailsDto.companyRegistrationNumber,
                    vatNumber: businessDetailsDto.vatNumber,
                    groupVatNumber: businessDetailsDto.groupVatNumber,
                    identificationType: businessDetailsDto.identificationType,
                    identificationNumber: businessDetailsDto.identificationNumber,
                    refundPolicy: businessDetailsDto.refundPolicy,
                    refundPolicyLocal: businessDetailsDto.refundPolicyLocal,
                });
              
                return { businessDetails: newBusinessDetail  };
  
          } 
          catch (error) {
              let errorMessage = error.message;
              if (error.code === 11000) {
                const keys = Object.keys(error.keyPattern || {});
                if ( keys.includes('companyRegistrationNumber') ) {
                  errorMessage = 'business_details_unique_company_registration_number';
                }
                else if( keys.includes('email')){
                  errorMessage = 'business_details_unique_email';
                }
              }
              callHTTPException(errorMessage);
          }
        }
  

          
        async getBusinessDetails( businessData: getBusinessDetailsDto, user: any ): Promise<any> {
            try {      
                    
                  const whereClause = { 
                      isDeleted: false, 
                      user_id: user['id'] 
                  };
        
        
                  const recordsCount = await this.businessDetailsModel.countDocuments(whereClause);
        
                  const businessDetailsList = await this.businessDetailsModel
                      .find(whereClause)
                      .select('-isDeleted -user_id -updatedAt') // exclude fields
                      .sort({ createdAt: -1 }) // descending order
                      .skip(businessData.offSet || 0)
                      .limit(businessData.limit || 10)
                      .exec();
        
                  return {
                      businessDetails: businessDetailsList,
                      recordsCount
                  };
        
            } 
            catch (error) {
                callHTTPException(error);
            }
        }


        async getBusinessDetailsListForSelection( user: any ): Promise<any> {
            try { 
                    const whereClause = { 
                      isDeleted: false, 
                      user_id: user['id'] 
                  };
        
                  const businessDetailsList = await this.businessDetailsModel
                      .find(whereClause)
                     // .select('id name companyName email phoneNumber createdAt addressStreet addressStreetAdditional country companyRegistrationNumber vatNumber groupVatNumber') // exclude fields
                      .sort({ createdAt: -1 }) // descending order
                      .exec();
        
                  return {
                      businessDetails: businessDetailsList
                  };

              }
              catch (error) {
                  callHTTPException(error);
              }   
          }


        
        
        async getBusinessDetailsById(businessData: businessDetailsByIdDto): Promise<any> {
          try { 
                      
                if (!isValidObjectId(businessData.id)) {
                  callHTTPException('invalid_business_detail_id');
                }
        
                const businessDetails = await this.businessDetailsModel
                    .findOne({ _id: businessData.id, isDeleted: false })
                    .select('-user_id -updatedAt');
                          
                if (!businessDetails) {
                    callHTTPException('business_detail_not_exist');  
                }
        
                return { businessDetails }; 
        
          }
          catch (error) {
            callHTTPException(error.message);
          }
        }


        
        
        
        async deleteBusinessDetails( businessData: businessDetailsByIdDto ): Promise<any> {
              try {
        
                      if (!isValidObjectId(businessData.id)) {
                          callHTTPException('invalid_business_detail_id');
                      }
        
                      const businessDetails =  await this.businessDetailsModel.findById(businessData.id)
                      if (!businessDetails) {
                        callHTTPException('business_detail_not_exist');  
                      }

                      const isBuinessDetailLinked = await this.invoiceModel.findOne({ 
                          business_detail: businessData.id,  
                          isDeleted: false
                      });

                        
                      if (isBuinessDetailLinked) {
                          callHTTPException('business_detail_linked_with_invoice');
                      }
        
                      businessDetails.isDeleted = true;
                      await businessDetails.save(); 
        
              } 
              catch (error) {
                callHTTPException(error.message);
              }
      }


      async updateBusinessDetails(businessData: UpdateBusinessDetailsDto, logo: any ): Promise<any> {
          try {
              
                if (!isValidObjectId(businessData.id)) {
                    callHTTPException('invalid_business_detail_id');
                }
                const isBusinessDetailExist = await this.businessDetailsModel.findOne(
                  { _id: businessData.id, isDeleted: false  }
                ).exec();

                if (!isBusinessDetailExist) {
                    callHTTPException('business_detail_not_exist');
                }

                let logoUrl: string = isBusinessDetailExist?.['logoUrl'];
                if(logo){
                  logoUrl = await uploadToS3(logo);
                }
                   
                const businessDetails = await this.businessDetailsModel.findOneAndUpdate(
                  { _id: businessData.id, isDeleted: false },
                  {
                    $set: {
                      name: businessData.name,
                      companyName: businessData.companyName,
                      email: businessData.email,
                      phoneNumber: businessData.phoneNumber,
                      companyNameLocal: businessData.companyNameLocal,
                      isVatRegistered: businessData.isVatRegistered,
                      logoUrl,
                      addressStreet: businessData.addressStreet,
                      addressStreetAdditional: businessData.addressStreetAdditional,
                      buildingNumber: businessData.buildingNumber,
                      country: businessData.country,
                      province: businessData.province,
                      city: businessData.city,
                      district: businessData.district,
                      postalCode: businessData.postalCode,
                      additionalNumber: businessData.additionalNumber,
                      addressLocal: businessData.addressLocal,
                      companyRegistrationNumber: businessData.companyRegistrationNumber,
                      vatNumber: businessData.vatNumber,
                      groupVatNumber: businessData.groupVatNumber,
                      identificationType: businessData.identificationType,
                      identificationNumber: businessData.identificationNumber,
                      refundPolicy: businessData.refundPolicy,
                      refundPolicyLocal: businessData.refundPolicyLocal,
                    },
                  },
                  {
                    new: true
                  },
                )
                .select('-isDeleted -user_id -updatedAt');              
                
                return { businessDetails };
            
          } 
          catch (error) {
              let errorMessage = error.message;
              if (error.code === 11000) {
                const keys = Object.keys(error.keyPattern || {});
                if ( keys.includes('companyRegistrationNumber') ) {
                  errorMessage = 'business_details_unique_company_registration_number';
                }
                else if( keys.includes('email')){
                  errorMessage = 'business_details_unique_email';
                }
              }
              callHTTPException(errorMessage);
          }
      }
 
}
