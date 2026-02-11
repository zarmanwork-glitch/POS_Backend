import { Injectable } from '@nestjs/common';
import { callHTTPException } from 'src/shared/exceptions';
import { Items } from './items.entity';
import { Model, Document, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateItemsDto, getItemsDto, itemsByIdDto, UpdateItemsDto } from './dto/item.dto';


@Injectable()
export class ItemsService {
    constructor(
      @InjectModel(Items.name) private readonly itemsModel: Model<Items & Document>,
    ) {}

  
        async createItems(userId:string, itemsDto: CreateItemsDto): Promise<any> {
          try {
              
                const newItems = await this.itemsModel.create({
                    user_id: userId, 
                    itemType: itemsDto.itemType,
                    itemStatus: itemsDto.itemStatus,
                    description: itemsDto.description,
                    materialNo: itemsDto.materialNo,
                    unitOfMeasure: itemsDto.unitOfMeasure,
                    buyPrice: itemsDto?.buyPrice,
                    sellPrice: itemsDto?.sellPrice,
                    discountPercentage: itemsDto?.discountPercentage
                });
  
                return { items: newItems  };
  
          } 
          catch (error) {
            callHTTPException(error.message);
          }
        }


        
        async getItemsList( itemsData: getItemsDto, user: any ): Promise<any> {
            try {

                    let sortOrder: 1 | -1 = itemsData['orderBy'] === 'asc' ? 1 : -1;
                    let sortBy = itemsData['sortBy'] || 'createdAt';

                    if (sortBy === 'chronological') {
                      sortBy = 'createdAt';
                    }


                    let status = itemsData['status'];
                    let unitOfMeasure = itemsData['unitOfMeasure'];
                    let buyPriceMin = itemsData['buyPriceMin'];
                    let sellPriceMin = itemsData['sellPriceMin'];
                    let buyPriceMax = itemsData['buyPriceMax'];
                    let sellPriceMax = itemsData['sellPriceMax'];


                    let searchBy = itemsData['searchBy'];
                    let search = itemsData['search'];
                    

                    const whereClause: any = {
                      isDeleted: false,
                      user_id: user.id,
                    };

                    if (searchBy && search) {
                      whereClause[searchBy] = { $regex: search, $options: 'i' };
                    }


                    if (status && status !== 'both') {
                        whereClause['itemStatus'] = status;   
                    }


                    if(unitOfMeasure){
                        whereClause['unitOfMeasure'] = unitOfMeasure;
                    }


                    if (buyPriceMin !== undefined || buyPriceMax !== undefined) {
                        whereClause['buyPrice'] = {};
                        if (buyPriceMin !== undefined) whereClause['buyPrice'].$gte = buyPriceMin;
                        if (buyPriceMax !== undefined) whereClause['buyPrice'].$lte = buyPriceMax;
                    }

                    if (sellPriceMin !== undefined || sellPriceMax !== undefined) {
                      whereClause['sellPrice'] = {};
                      if (sellPriceMin !== undefined) whereClause['sellPrice'].$gte = sellPriceMin;
                      if (sellPriceMax !== undefined) whereClause['sellPrice'].$lte = sellPriceMax;
                    }


                    const recordsCount = await this.itemsModel.countDocuments(whereClause);

                    const itemsList = await this.itemsModel
                      .find(whereClause)
                      .select('-isDeleted -user_id -updatedAt')
                      .sort({ [sortBy]: sortOrder } as any)  
                      .skip(itemsData.offSet || 0)
                      .limit(itemsData.limit || 10)
                      .exec();

                    return {
                      items: itemsList,
                      recordsCount
                    };
        
                } 
                catch (error) {
                  callHTTPException(error);
                }
          }



          
        
        async getItemsListForSelection( user: any ): Promise<any> {
            try {
                
                    const whereClause: any = {
                      isDeleted: false,
                      user_id: user.id,
                    };


                    const itemsList = await this.itemsModel
                      .find(whereClause)
                      .select('id description materialNo unitOfMeasure sellPrice discountPercentage createdAt')
                      .sort({ createdAt: -1 })
                      .exec();

                    return {
                      items: itemsList,
                      recordsCount: itemsList.length
                    };
        
                } 
                catch (error) {
                  callHTTPException(error);
                }
          }


              
        async getItemById(itemData: itemsByIdDto): Promise<any> {
            try { 
                      
                    if (!isValidObjectId(itemData.id)) {
                      callHTTPException('invalid_item_id');
                    }
              
                    const itemDetails = await this.itemsModel
                      .findOne({ _id: itemData.id, isDeleted: false })
                      .select('-user_id -updatedAt');
              
                        
                          
                    if (!itemDetails) {
                        callHTTPException('item_not_exist');
                    }
              
                    return { items: itemDetails }; 
              
            }
            catch (error) {
                callHTTPException(error.message);
            }
        }
              
              

      
        async deleteItems( itemData: itemsByIdDto ): Promise<any> {
            try {
      
                    if (!isValidObjectId(itemData.id)) {
                      callHTTPException('invalid_item_id');
                    }
      
                    const item = await this.itemsModel.findById(itemData.id)
                    if (!item) {
                      callHTTPException('item_not_exist');  
                    }
      
                    item.isDeleted = true;
                    await item.save(); 
      
            } 
            catch (error) {
              callHTTPException(error.message);
            }
        }


         
        async updateItem(itemData: UpdateItemsDto ): Promise<any> {
            try {
                    
                  if (!isValidObjectId(itemData.id)) {
                    callHTTPException('invalid_item_id');
                  }
        
                  const itemDetails = await this.itemsModel.findOneAndUpdate(
                      { _id: itemData.id, isDeleted: false },
                      {
                        $set: {
                            itemType: itemData.itemType,
                            itemStatus: itemData.itemStatus,
                            description: itemData.description,
                            materialNo: itemData.materialNo,
                            unitOfMeasure: itemData.unitOfMeasure,
                            buyPrice: itemData.buyPrice,
                            sellPrice: itemData.sellPrice,
                            discountPercentage: itemData.discountPercentage
                          },
                      },
                      { new: true } 
                    )
                  .select('-isDeleted -user_id -updatedAt');
         
                  if (!itemDetails) {
                      callHTTPException('item_not_exist');
                  }
                
                  return { items: itemDetails };
            } 
            catch (error) {
              callHTTPException(error.message);
            }
        }
      
              
}
