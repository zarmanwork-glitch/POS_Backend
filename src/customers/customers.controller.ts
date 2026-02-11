import {  Controller, Post, Get, Req, Body, Patch } from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  GetObjectTemplateForAPIResponseGeneral,
  ObjectTemplateForAPIResponseGeneral,
} from 'src/shared/data_templates/ObjectTemplateForAPIResponse';
import { EnumAPIResponseStatusType } from 'src/shared/enums';
import { callHTTPException } from 'src/shared/exceptions';
import { CreateCustomersDto, customerDetailsByIdDto, getCustomerDetailsDto, UpdateCustomerDto } from './dto';


@Controller('customers')
export class CustomersController {
    constructor(
      private readonly customersService: CustomersService,
    ) {}


  
      @Post('add')
      async addCustomer( 
          @Body() customerData: CreateCustomersDto,
          @Req() request: string,
        ): Promise<any> {
          try {
            const customerDetails = await this.customersService.AddCustomer(request['user']['id'], customerData);
            return GetObjectTemplateForAPIResponseGeneral(
              EnumAPIResponseStatusType.SUCCESS,
              customerDetails,
              'add_customer_success',
            );
          } 
          catch (error) {
            callHTTPException(error.message);
          }
      }

      
          
      @Post('list')
      async getCustomers(
          @Body() customerData: getCustomerDetailsDto,
          @Req() request: Request
      ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try {
            const data = await this.customersService.getCustomersList( 
              customerData,
              request['user'],
            );
      
            const message =  data?.customers.length > 0
                ? 'get_customers_success'
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
      async getCustomersListForSelection(
          @Req() request: Request
      ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try {
            const data = await this.customersService.getCustomersListForSelection( 
              request['user'],
            );
      
            const message =  data?.customers.length > 0
                ? 'get_customers_success'
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



            
        @Post('id')
        async getCustomerDetailsById(
              @Body() customerDetails: customerDetailsByIdDto,
        ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
            try {
                return GetObjectTemplateForAPIResponseGeneral(
                  EnumAPIResponseStatusType.SUCCESS,
                  await this.customersService.getCustomerById(customerDetails),
                  'get_customer_by_id_success',
                );
            } 
            catch (error) {
                throw error;
            }
        }
        

        
                
        @Post('delete')
        async deleteCustomer(
            @Body() deleteCustomerDto: customerDetailsByIdDto 
        )
        :Promise<typeof ObjectTemplateForAPIResponseGeneral> {
            try{
                      
                  return GetObjectTemplateForAPIResponseGeneral(
                      EnumAPIResponseStatusType.SUCCESS,
                      await this.customersService.deleteCustomer(deleteCustomerDto),
                      'delete_customer_success',
                  );
            }
            catch(error){
                throw error;
            }
        }
        
      
      @Patch('update')
      async updateCustomer( 
          @Body() customerData: UpdateCustomerDto
        ): Promise<any> {
          try {
            const customerDetails = await this.customersService.UpdateCustomer(customerData);
            return GetObjectTemplateForAPIResponseGeneral(
              EnumAPIResponseStatusType.SUCCESS,
              customerDetails,
              'update_customer_success',
            );
          } 
          catch (error) {
            callHTTPException(error.message);
          }
      }

}