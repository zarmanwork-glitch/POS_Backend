import {  Controller, Post, Patch, Req, Body, UseInterceptors,  UploadedFile } from '@nestjs/common';
import { BusinessDetailsService } from './business_details.service';
import {
  GetObjectTemplateForAPIResponseGeneral,
  ObjectTemplateForAPIResponseGeneral,
} from 'src/shared/data_templates/ObjectTemplateForAPIResponse';
import { EnumAPIResponseStatusType, EnumIdentificationType } from 'src/shared/enums';
import { callHTTPException } from 'src/shared/exceptions';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBusinessDetailsDto, businessDetailsByIdDto, getBusinessDetailsDto, UpdateBusinessDetailsDto } from './dto';


@Controller('business-details')
export class BusinessDetailsController {
      constructor(
        private readonly businessDetailsService: BusinessDetailsService,
      ) {}

  
      @Post('add')
       @UseInterceptors(
          FileInterceptor('logo', {  
            limits: { fileSize: 1024 * 1024 },  // file size 1 mb
          }),
        )    
      async addBusinessDetails( 
          @Body() businessDetailsDto: CreateBusinessDetailsDto,
          @Req() request: string,
           @UploadedFile() logo: Express.Multer.File,
        ): Promise<any> {
          try {
                
                const businessDetails = await this.businessDetailsService.addBusinessDetails(
                    request['user']['id'], 
                    businessDetailsDto,
                    logo
                );
                
                return GetObjectTemplateForAPIResponseGeneral(
                  EnumAPIResponseStatusType.SUCCESS,
                  businessDetails,
                  'add_business_details_success'
                );
          } 
          catch (error) {
            callHTTPException(error.message);
          }
      }
      

      
        @Post('list')
        async getBusinessDetails(
          @Body() businessData: getBusinessDetailsDto,
          @Req() request: Request
        ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try {
              const data = await this.businessDetailsService.getBusinessDetails( 
                businessData,
                request['user'],
              );
        
              const message =  data?.businessDetails.length > 0
                  ? 'get_business_details_success'
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
        async getBusinessDetailsListForSelection(
          @Req() request: Request
        ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try {
              const data = await this.businessDetailsService.getBusinessDetailsListForSelection( 
                request['user'],
              );
        
              const message =  data?.businessDetails.length > 0
                  ? 'get_business_details_success'
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
        async getBusinessDetailsById(
              @Body() businessDetails: businessDetailsByIdDto,
        ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try {
                return GetObjectTemplateForAPIResponseGeneral(
                  EnumAPIResponseStatusType.SUCCESS,
                  await this.businessDetailsService.getBusinessDetailsById(businessDetails),
                  'get_business_detail_by_id_success',
                );
          } 
          catch (error) {
              throw error;
          }
      }
   

      
              
      @Post('delete')
      async deleteBusinessDetails(
          @Body() deleteBusinessDetailsDto: businessDetailsByIdDto 
      )
      : Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try{
                    
              return GetObjectTemplateForAPIResponseGeneral(
                  EnumAPIResponseStatusType.SUCCESS,
                  await this.businessDetailsService.deleteBusinessDetails(deleteBusinessDetailsDto ),
                  'delete_business_detail_success'
              );
          }
          catch(error){
              throw error;
          }
      }


      
      @Patch('update')
      @UseInterceptors(
          FileInterceptor('logo', {  
            limits: { fileSize: 1024 * 1024 },  // file size 1 mb
          }),
      )    
      async updateBusinessDetails( 
          @Body() businessData: UpdateBusinessDetailsDto,
          @UploadedFile() logo: Express.Multer.File,
        ): Promise<any> {
          try {
                const businessDetails = await this.businessDetailsService.updateBusinessDetails(
                    businessData,
                    logo
                );
                
                return GetObjectTemplateForAPIResponseGeneral(
                  EnumAPIResponseStatusType.SUCCESS,
                  businessDetails,
                  'update_business_details_success'
                );
          } 
          catch (error) {
            callHTTPException(error.message);
          }
      }
      
      

}