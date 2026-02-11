import { IsNotEmpty, IsString, IsOptional, IsInt, IsEnum, IsIn, ValidateIf } from 'class-validator';
import { EnumUnitOfMeasure } from 'src/shared/enums';
import {Type} from 'class-transformer';


export class CreateItemsDto {
    @IsNotEmpty()
    @IsIn(['service', 'material', 'خدمة', 'مواد'])
    itemType: string;


    @IsNotEmpty()
    @IsIn(['enabled', 'disabled', 'غير مفعل', 'مفعل'])
    itemStatus: string; 

    
    @IsNotEmpty()
    @IsString()
    description: string;


    @IsNotEmpty()
    @IsString()
    materialNo: string;


    @IsNotEmpty()
    @IsEnum(EnumUnitOfMeasure)
    unitOfMeasure: EnumUnitOfMeasure;


    @IsOptional()
    @IsInt()
    buyPrice?: number;


    @IsOptional()
    @IsInt()
    sellPrice?: number;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    discountPercentage?: number;
}




export class getItemsDto {
    @IsInt()
    @IsNotEmpty()
    offSet: number;


    @IsInt()
    @IsOptional()
    limit: number; 


    @IsOptional()
    @IsIn(['chronological', 'description', 'materialNo'])
    sortBy: string;



    @IsOptional()
    @IsIn(['asc', 'desc'])
    orderBy: string;


    @IsOptional()
    @IsIn(['description', 'materialNo'])
    searchBy: string;


    @ValidateIf((obj) => !!obj.searchBy) 
    @IsNotEmpty({ message: 'search is required when searchBy is provided' })
    search: string;


    @IsOptional()
    @IsIn(['both', 'enabled', 'disabled'])
    status: string;


    @IsOptional()
    @IsEnum(EnumUnitOfMeasure)
    unitOfMeasure: string;


    @IsOptional()
    @IsInt()
    buyPriceMin: number;

    
    @IsOptional()
    @IsInt()
    buyPriceMax: number;


    @IsOptional()
    @IsInt()
    sellPriceMin: number;


    @IsOptional()
    @IsInt()
    sellPriceMax: number;
}




export class itemsByIdDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}


export class UpdateItemsDto{
    @IsNotEmpty()
    @IsString()
    id: string;


    @IsOptional()
    @IsIn(['service', 'material', 'خدمة', 'مواد'])
    itemType?: string;



    @IsOptional()
    @IsIn(['enabled', 'disabled', 'غير مفعل', 'مفعل'])
    itemStatus?: string; 

    
    @IsOptional()
    @IsString()
    description?: string;


    @IsOptional()
    @IsString()
    materialNo?: string;


    @IsOptional()
    @IsEnum(EnumUnitOfMeasure)
    unitOfMeasure?: EnumUnitOfMeasure;


    @IsOptional()
    @IsInt()
    buyPrice?: number;


    @IsOptional()
    @IsInt()
    sellPrice?: number;


    @IsOptional()
    @IsInt()
    discountPercentage?: number;
}
