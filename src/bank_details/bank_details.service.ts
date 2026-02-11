import {  Injectable } from '@nestjs/common';
import { callHTTPException } from 'src/shared/exceptions';
import { CreateBankDetailsDto, getBankDetailsDto, UpdateBankDetailsDto, bankDetailsByIdDto } from './dto/bank_details.dto';
import { Model, Document, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BankDetails } from './bank_details.entity';
import {Invoices } from '../invoices/invoices.entity';


@Injectable()
export class BankDetailsService {
  constructor(
      @InjectModel(BankDetails.name) private readonly bankDetailsModel: Model<BankDetails & Document>,
      @InjectModel(Invoices.name) private readonly invoiceModel: Model<Invoices & Document>,
  ) {}

  
      async createBankDetails(userId:string, bankDetailsDto: CreateBankDetailsDto): Promise<any> {
        try {
            
              const newBankDetail = await this.bankDetailsModel.create({
                  user_id: userId, 
                  country: bankDetailsDto.country,
                  accountNumber: bankDetailsDto.accountNumber,
                  iban: bankDetailsDto.iban,
                  bankName: bankDetailsDto.bankName,
                  swiftCode: bankDetailsDto.swiftCode,
                  beneficiaryName: bankDetailsDto.beneficiaryName
              });

            
              return { bankDetails: newBankDetail  };

        } 
        catch (error) {
              let errorMessage = error.message;
              if (error.code === 11000) {
                  const keys = Object.keys(error.keyPattern || {});
                  if( keys.includes('accountNumber') ) {
                      errorMessage = 'bank_details_unique_account_number';
                  }
                  else if( keys.includes('iban') ) {
                      errorMessage = 'bank_details_unique_iban';
                  }
              }
              callHTTPException(errorMessage);
        }
      }


    
        
      async getBankDetails(
        bankData: getBankDetailsDto,
        user: any
      ): Promise<any> {
        try {

            const whereClause = { 
              isDeleted: false, 
              user_id: user['id'] 
            };


            const recordsCount = await this.bankDetailsModel.countDocuments(whereClause);

            const bankDetailsList = await this.bankDetailsModel
              .find(whereClause)
              .select('-isDeleted -user_id -updatedAt') // exclude fields
              .sort({ createdAt: -1 }) // descending order
              .skip(bankData.offSet || 0)
              .limit(bankData.limit || 10)
              .exec();

            return {
              bankDetails: bankDetailsList,
              recordsCount
            };

        } 
        catch (error) {
          callHTTPException(error);
        }
      }



      
    
        
      async getBankDetailsListForSelection( user: any ): Promise<any> {
        try {

            const whereClause = { 
              isDeleted: false, 
              user_id: user['id'] 
            };
       

            const bankDetailsList = await this.bankDetailsModel
              .find(whereClause)
             // .select('id bankName country accountNumber createdAt') // exclude fields
              .sort({ createdAt: -1 }) // descending order
              .exec();

            return {
              bankDetails: bankDetailsList
            };

        } 
        catch (error) {
          callHTTPException(error);
        }
      }
    
    

      
    async updateBankDetails(bankData: UpdateBankDetailsDto ): Promise<any> {
      try {
            
            if (!isValidObjectId(bankData.id)) {
                callHTTPException('invalid_bank_detail_id');
            }
              

            const bankDetails = await this.bankDetailsModel.findOneAndUpdate(
                { _id: bankData.id, isDeleted: false },
                {
                  $set: {
                    country: bankData.country,
                    accountNumber: bankData.accountNumber,
                    iban: bankData.iban,
                    bankName: bankData.bankName,
                    swiftCode: bankData.swiftCode,
                    beneficiaryName: bankData.beneficiaryName,
                  },
                },
                { new: true } 
              )
              .select('-isDeleted -user_id -updatedAt');


            if (!bankDetails) {
              callHTTPException('bank_detail_not_exist')
            }


            return { bankDetails };
      } 
      catch (error) {
          let errorMessage = error.message;
          if (error.code === 11000) {
              const keys = Object.keys(error.keyPattern || {});
              if( keys.includes('accountNumber') ) {
                   errorMessage = 'bank_details_unique_account_number';
              }
              else if( keys.includes('iban') ) {
                    errorMessage = 'bank_details_unique_iban';
              }
          }
          callHTTPException(errorMessage);
      }
    }



    async getBankDetailsById(bankData: bankDetailsByIdDto): Promise<any> {
      try { 
              if (!isValidObjectId(bankData.id)) {
                  callHTTPException('invalid_bank_detail_id')
              }

              const bankDetails = await this.bankDetailsModel
              .findOne({ _id: bankData.id, isDeleted: false })
              .select('-user_id -updatedAt');

          
            
              if (!bankDetails) {
                callHTTPException('bank_detail_not_exist')
              }

              return { bankDetails }; 

      }
      catch (error) {
        callHTTPException(error.message);
      }
    }





    async deleteBankDetails( bankData: bankDetailsByIdDto ): Promise<any> {
      try {

              if (!isValidObjectId(bankData.id)) {
                  callHTTPException('invalid_bank_detail_id')
              }

              const bankDetails =  await this.bankDetailsModel.findById(bankData.id)
              if (!bankDetails) {
                callHTTPException('bank_detail_not_exist')
              }


              const isBankDetailLinked = await this.invoiceModel.findOne({ 
                  bank_detail: bankData.id,  
                  isDeleted: false
              });

                        
              if (isBankDetailLinked) {
                  callHTTPException('bank_detail_linked_with_invoice');
              }
        

              bankDetails.isDeleted = true;
              await bankDetails.save(); 

      } 
      catch (error) {
        callHTTPException(error.message);
      }
    }

}
