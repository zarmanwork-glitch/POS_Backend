import {  Controller, Post, Get, Req, Body, Put, UseInterceptors, UsePipes,
  ValidationPipe,  UploadedFile, Res
} from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import {
  GetObjectTemplateForAPIResponseGeneral,
  ObjectTemplateForAPIResponseGeneral,
} from 'src/shared/data_templates/ObjectTemplateForAPIResponse';
import { EnumAPIResponseStatusType } from 'src/shared/enums';
import { callHTTPException } from 'src/shared/exceptions';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateInvoiceDto, getInvoiceListDto, getInvoiceByIdDto } from './dto';


@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
  ) {}


  
        @Post('create')
         @UseInterceptors(
            FileInterceptor('logo', {  
              limits: { fileSize: 1024 * 1024 },  // file size 1 mb
            }),
          )    
        async createInvoice( 
            @Body() invoiceDto: CreateInvoiceDto,
            @Req() request: string,
             @UploadedFile() logo: Express.Multer.File,
          ): Promise<any> {
            try {
                  
                  const businessDetails = await this.invoicesService.CreateInvoice(
                      request['user']['id'], 
                      invoiceDto,
                      logo
                  );
                  
                  return GetObjectTemplateForAPIResponseGeneral(
                    EnumAPIResponseStatusType.SUCCESS,
                    businessDetails,
                    'create_invoice_success'
                  );
            } 
            catch (error) {
              callHTTPException(error.message);
            }
        }
        
  

         
        @Post('list')
        async getInvoicesList(
            @Body() invoiceData: getInvoiceListDto,
            @Req() request: Request
        ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
            try {
                  
                  const data = await this.invoicesService.getInvoicesList( 
                      invoiceData,
                      request['user'],
                  );
                
                  const message =  data?.invoice.length > 0
                      ? 'get_invoices_success'
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


           
 

               
        @Post('download')
      async downloadInvoice(
          @Body() invoiceDetails: getInvoiceByIdDto,
          @Res() res: Response,
        ) {
          const { buffer, fileName } = await this.invoicesService.downloadInvoice(invoiceDetails);

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
          res.setHeader('Content-Length', buffer.length);

          res.end(buffer);
        }
                
        

               
        @Post('id')
        async getInvoiceById(
            @Body() invoiceDetails: getInvoiceByIdDto,
        ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
              try {
                    
                    return GetObjectTemplateForAPIResponseGeneral(
                        EnumAPIResponseStatusType.SUCCESS,
                        await this.invoicesService.getInvoiceById(invoiceDetails),
                        'get_invoice_by_id_success',
                    );                    
              } 
              catch (error) {
                  throw error;
              }
        }
        

}