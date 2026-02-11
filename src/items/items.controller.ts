import {  Controller, Post, Req, Body, Patch } from '@nestjs/common';
import { ItemsService } from './items.service';
import {
  GetObjectTemplateForAPIResponseGeneral,
  ObjectTemplateForAPIResponseGeneral,
} from 'src/shared/data_templates/ObjectTemplateForAPIResponse';
import { EnumAPIResponseStatusType } from 'src/shared/enums';
import { callHTTPException } from 'src/shared/exceptions';
import { CreateItemsDto, getItemsDto, itemsByIdDto, UpdateItemsDto  } from './dto';



@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
  ) {}


  
      @Post('add')
      async addItems( 
          @Body() itemsDto: CreateItemsDto,
          @Req() request: string,
        ): Promise<any> {
          try {
            const items = await this.itemsService.createItems(request['user']['id'], itemsDto);
            return GetObjectTemplateForAPIResponseGeneral(
              EnumAPIResponseStatusType.SUCCESS,
              items,
              'add_item_success'
            );
          } 
          catch (error) {
            callHTTPException(error.message);
          }
      }

          
      @Post('list')
      async getItemsList(
          @Body() itemsData: getItemsDto,
          @Req() request: Request
      ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try {
            const data = await this.itemsService.getItemsList( 
              itemsData,
              request['user'],
            );
      
            const message =  data?.items.length > 0
                ? 'get_items_success'
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
      async getItemsListForSelection(
          @Req() request: Request
      ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try {
            const data = await this.itemsService.getItemsListForSelection( 
              request['user'],
            );
      
            const message =  data?.items.length > 0
                ? 'get_items_success'
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
      async getItemById( @Body() itemDetail: itemsByIdDto )
      : Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try {
              return GetObjectTemplateForAPIResponseGeneral(
                EnumAPIResponseStatusType.SUCCESS,
                await this.itemsService.getItemById(itemDetail),
                'get_item_by_id_success',
              );
          } 
          catch (error) {
              throw error;
          }
      }


      
              
      @Post('delete')
      async deleteItems(
          @Body() deleteItemsDto: itemsByIdDto 
      )
      : Promise<typeof ObjectTemplateForAPIResponseGeneral> {
          try{
                    
                return GetObjectTemplateForAPIResponseGeneral(
                    EnumAPIResponseStatusType.SUCCESS,
                    await this.itemsService.deleteItems(deleteItemsDto ),
                    'delete_item_success'
                );
          }
          catch(error){
              throw error;
          }
      }


      
      @Patch('update')
      async updateItemDetails(
        @Body() itemDetails: UpdateItemsDto
      ): Promise<typeof ObjectTemplateForAPIResponseGeneral> {
        try {
          return GetObjectTemplateForAPIResponseGeneral(
            EnumAPIResponseStatusType.SUCCESS,
            await this.itemsService.updateItem(
              itemDetails
            ),
            'update_item_success'
          );
        } 
        catch (error) {
          throw error;
        }
      }

    
      
}