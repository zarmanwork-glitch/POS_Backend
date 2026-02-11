import { Controller, Post, Req, Body, Patch } from '@nestjs/common';
import { BankDetailsService } from './bank_details.service';
import {
  GetObjectTemplateForAPIResponseGeneral,
  ObjectTemplateForAPIResponseGeneral,
} from 'src/shared/data_templates/ObjectTemplateForAPIResponse';
import { EnumAPIResponseStatusType } from 'src/shared/enums';
import { callHTTPException } from 'src/shared/exceptions';
import { CreateBankDetailsDto, getBankDetailsDto, UpdateBankDetailsDto, bankDetailsByIdDto } from './dto/index';


@Controller('bank-details')
export class BankDetailsController {
  constructor(
    private readonly bankDetailsService: BankDetailsService,
  ) {}

  

    @Post('create')
    async addBankDetails( 
        @Body() bankDetailsDto: CreateBankDetailsDto,
        @Req() request: string,
      ): Promise<any> {
        try {
          const bankDetails = await this.bankDetailsService.createBankDetails(request['user']['id'], bankDetailsDto);
          return GetObjectTemplateForAPIResponseGeneral(
            EnumAPIResponseStatusType.SUCCESS,
            bankDetails,
            'add_bank_details_success'
          );
        } 
        catch (error) {
          callHTTPException(error.message);
        }
    }
    
 
    
    
  @Post('list')
  async getBankDetails(
    @Body() getBankDetailsDto: getBankDetailsDto,
    @Req() request: Request
  ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
    try {
      const data = await this.bankDetailsService.getBankDetails( 
        getBankDetailsDto,
        request['user'],
      );

      const message =  data?.bankDetails.length > 0
          ? 'get_bank_details_success'
          : 'no_record_found';

      return GetObjectTemplateForAPIResponseGeneral(
        EnumAPIResponseStatusType.SUCCESS,
        data,
        message,
      );
    } 
    catch (error) {
      throw error;
    }
  }


     
  @Post('listForSelection')
  async getBankDetailsListForSelection(
    @Req() request: Request
  ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
    try {
      const data = await this.bankDetailsService.getBankDetailsListForSelection( 
        request['user']
      );

      const message =  data?.bankDetails.length > 0
          ? 'get_bank_details_success'
          : 'no_record_found';

      return GetObjectTemplateForAPIResponseGeneral(
        EnumAPIResponseStatusType.SUCCESS,
        data,
        message,
      );
    } 
    catch (error) {
      throw error;
    }
  }



    
    @Patch('update')
    async updateBankDetails(
      @Body() bankDetails: UpdateBankDetailsDto
    ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
      try {
        return GetObjectTemplateForAPIResponseGeneral(
          EnumAPIResponseStatusType.SUCCESS,
          await this.bankDetailsService.updateBankDetails(
            bankDetails
          ),
          'update_bank_details_success',
        );
      } 
      catch (error) {
        throw error;
      }
    }


      
    @Post('id')
    async getBankDetailsById(
      @Body() bankDetails: bankDetailsByIdDto,
    ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
      try {
        return GetObjectTemplateForAPIResponseGeneral(
          EnumAPIResponseStatusType.SUCCESS,
          await this.bankDetailsService.getBankDetailsById(bankDetails),
          'get_bank_detail_by_id_success',
        );
      } 
      catch (error) {
        throw error;
      }
    }



        
    @Post('delete')
    async deleteBankDetails(
        @Body() deleteBankDetailsDto: bankDetailsByIdDto 
      )
      : Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try{
              
              return GetObjectTemplateForAPIResponseGeneral(
                  EnumAPIResponseStatusType.SUCCESS,
                  await this.bankDetailsService.deleteBankDetails(deleteBankDetailsDto ),
                  'delete_bank_details_success',
              );
          }
          catch(error){
              throw error;
          }
    }

}