import { Injectable } from '@nestjs/common';
import { callHTTPException } from 'src/shared/exceptions';
import { CreateCustomersDto, getCustomerDetailsDto, customerDetailsByIdDto, UpdateCustomerDto } from './dto';
import { Model, Document, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Customers } from './customers.entity';
import {Invoices } from '../invoices/invoices.entity';


@Injectable()
export class CustomersService {
  constructor(
      @InjectModel(Customers.name) private readonly customersModel: Model<Customers & Document>,
      @InjectModel(Invoices.name) private readonly invoiceModel: Model<Invoices & Document>,
  ) {}


        async AddCustomer(userId:string, customerData: CreateCustomersDto): Promise<any> {
          try {
              
                const newCustomerDetail = await this.customersModel.create({
                    user_id: userId, 
                    name: customerData.name,
                    companyName: customerData.companyName,
                    customerNumber: customerData.customerNumber,
                    email: customerData.email,
                    phoneNumber: customerData.phoneNumber,
                    companyNameLocal: customerData.companyNameLocal,
                    addressStreet: customerData.addressStreet,
                    addressStreetAdditional: customerData.addressStreetAdditional,
                    country: customerData.country,
                    province: customerData.province,
                    district: customerData.district,
                    postalCode: customerData.postalCode,
                    addressLocal: customerData.addressLocal,
                    buildingNumber: customerData.buildingNumber,
                    city: customerData.city,
                    neighborhood: customerData.neighborhood,
                    companyRegistrationNumber: customerData.companyRegistrationNumber,
                    vatNumber: customerData.vatNumber,
                    groupVatNumber: customerData.groupVatNumber,
                    identificationType: customerData.identificationType,
                    identificationNumber: customerData.identificationNumber,                  
                });
              
                return { customers: newCustomerDetail  };
  
          } 
          catch (error) {
              let errorMessage = error.message;
              if (error.code === 11000) {
                    const keys = Object.keys(error.keyPattern || {});
                    if( keys.includes('email')){
                      errorMessage = 'customer_unique_email';
                    }
              }
              callHTTPException(errorMessage);
          }
        }
  

        
                
        async getCustomersList(
            customerData: getCustomerDetailsDto,
            user: any
        ): Promise<any> {
            try {
        
                    let sortOrder: 1 | -1 = customerData['orderBy'] === 'asc' ? 1 : -1;
                    let sortBy = customerData['sortBy'] || 'createdAt';
                    let searchBy = customerData['searchBy'];
                    let search = customerData['search'];


                    if (sortBy === 'chronological') {
                      sortBy = 'createdAt';
                    }

                    const whereClause: any = {
                      isDeleted: false,
                      user_id: user.id,
                    };

                    
                    if (searchBy && search) {
                      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      whereClause[searchBy] = { $regex: safeSearch, $options: 'i' };
                    }


                  const recordsCount = await this.customersModel.countDocuments(whereClause);
        
                  const customerList = await this.customersModel
                      .find(whereClause)
                      .select('-isDeleted -user_id -updatedAt')
                      .sort({ [sortBy]: sortOrder } as any)  
                      .skip(customerData.offSet || 0)
                      .limit(customerData.limit || 10)
                      .exec();
        
                    return {
                      customers: customerList,
                      recordsCount
                    };
        
                } 
                catch (error) {
                  callHTTPException(error);
                }
        }



          
                
        async getCustomersListForSelection( user: any ): Promise<any> {
            try {

                    const whereClause: any = {
                      isDeleted: false,
                      user_id: user.id,
                    };

        
                  const customerList = await this.customersModel
                      .find(whereClause)
                     // .select('id name companyName email phoneNumber createdAt') // exclude fields
                      .sort({ createdAt: -1 }) // descending order
                      .exec();
        
                    return {
                      customers: customerList,
                    };
        
                } 
                catch (error) {
                  callHTTPException(error);
                }
        }


              

              
              
        async getCustomerById(customerData: customerDetailsByIdDto): Promise<any> {
                  try { 
                            
                        if (!isValidObjectId(customerData.id)) {
                            callHTTPException('invalid_customer_id');
                        }
              
                        const customer = await this.customersModel
                          .findOne({ _id: customerData.id, isDeleted: false })
                          .select('-user_id -updatedAt');
              
                        
                          
                        if (!customer) {
                            callHTTPException('customer_not_exist');  
                        }
              
                        return {customers: customer }; 
              
                  }
                  catch (error) {
                      callHTTPException(error.message);
                  }            
          }
              

              
              
          async deleteCustomer( customerData: customerDetailsByIdDto ): Promise<any> {
                  try {
              
                        if (!isValidObjectId(customerData.id)) {
                            callHTTPException('invalid_customer_id');
                        }
          
                        const customer = await this.customersModel.findById(customerData.id)
                        if (!customer) {
                            callHTTPException('customer_not_exist');  
                        }


                        const isCustomerLinked = await this.invoiceModel.findOne({ 
                          customer: customerData.id,  
                          isDeleted: false
                        });

                        
                        if (isCustomerLinked) {
                          callHTTPException('customer_linked_with_invoice');
                        }
                                  
                        customer.isDeleted = true;
                        await customer.save(); 
              
                  } 
                  catch (error) {
                      callHTTPException(error.message);
                  }
        }

              
              
            
        async UpdateCustomer(customerData: UpdateCustomerDto): Promise<any> {
          try {
                  
              if (!isValidObjectId(customerData.id)) {
                  callHTTPException('invalid_customer_id');
              }

              const customer = await this.customersModel.findOneAndUpdate(
                { _id: customerData.id, isDeleted: false },
                {
                  $set: {             
                      name: customerData.name,
                      companyName: customerData.companyName,
                      customerNumber: customerData.customerNumber,
                      email: customerData.email,
                      phoneNumber: customerData.phoneNumber,
                      companyNameLocal: customerData.companyNameLocal,
                      addressStreet: customerData.addressStreet,
                      addressStreetAdditional: customerData.addressStreetAdditional,
                      country: customerData.country,
                      province: customerData.province,
                      district: customerData.district,
                      postalCode: customerData.postalCode,
                      addressLocal: customerData.addressLocal,
                      buildingNumber: customerData.buildingNumber,
                      city: customerData.city,
                      neighborhood: customerData.neighborhood,
                      companyRegistrationNumber: customerData.companyRegistrationNumber,
                      vatNumber: customerData.vatNumber,
                      groupVatNumber: customerData.groupVatNumber,
                      identificationType: customerData.identificationType,
                      identificationNumber: customerData.identificationNumber,         
                  },
                },
                { new: true } 
              )
              .select('-isDeleted -user_id -updatedAt');



              if (!customer) {
                callHTTPException('customer_not_exist');
              }

              return { customers: customer };
          } 
          catch (error) {
              let errorMessage = error.message;
              if (error.code === 11000) {
                    const keys = Object.keys(error.keyPattern || {});
                    if( keys.includes('email')){
                      errorMessage = 'customer_unique_email';
                    }
              }
              callHTTPException(errorMessage);
          }
        }
}
