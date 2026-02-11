import { IsNotEmpty, IsString, IsOptional, IsInt, IsDate, IsBoolean, ArrayNotEmpty, IsArray, 
    IsNumber, ValidateNested, IsIn,  IsMongoId, IsEnum, ValidateIf, Min, Max,
    registerDecorator, ValidationOptions, ValidationArguments
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EnumIncoTerms, EnumUnitOfMeasure } from 'src/shared/enums/.enum';


export function ValidateDiscount(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validateDiscount',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const obj = args.object as any;
                    if (value == null) return true; 

                    if (obj.discountType === 'percentage') {
                        return value >= 0 && value <= 100;
                    } else if (obj.discountType === 'number') {
                        return value >= 0 && value <= obj.unitRate;
                    }

                    return true; 
                },
                defaultMessage(args: ValidationArguments) {
                    const obj = args.object as any;
                    if (obj.discountType === 'percentage') {
                        return 'Discount percentage must be between 0 and 100';
                    } else if (obj.discountType === 'number') {
                        return 'Discount cannot be negative or greater than unit rate';
                    }
                    return 'Invalid discount value';
                },
            },
        });
    };
}


class AddItemsDto {
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    no: number;


    @IsNotEmpty()
    @IsString()
    description: string;


    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    quantity: number;



    @IsNotEmpty()
    @IsIn(['percentage', 'number'])
    discountType: string;


    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @ValidateDiscount()
    discount?: number;


    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    unitRate: number;



    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    taxRate: number;

    
    @IsNotEmpty()
    @IsString()
    taxCode: string;


    @IsOptional()
    @IsString()
    vatExemptionReason: string;



    @IsOptional()
    @IsString()
    serviceCode?: string;


    @IsNotEmpty()
    @IsEnum(EnumUnitOfMeasure)
    unit: string;


    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    reportingTags?: string[];
    
}


export class CreateInvoiceDto {
    @IsOptional()
    @IsString()
    invoiceNumber?: string;


    @IsNotEmpty()
    @IsEnum(EnumIncoTerms)
    incoterms: string;


    @IsOptional()
    @IsString()
    location?: string;


    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    invoiceDate: Date;


    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    dueDate: Date;


   
    @IsOptional()
    @Transform(({ value }) => (value ? new Date(value) : undefined), {
        toClassOnly: true,
    })
    @IsDate()
    supplyDate?: Date;


    @IsOptional()
    @Transform(({ value }) => (value ? new Date(value) : undefined), {
        toClassOnly: true,
    })
    @IsDate()
    supplyEndDate?: Date;


    @IsOptional()
    @IsString()
    contractId?: string; 


    @IsOptional()
    @IsString()
    customerPoNumber?: string;

    
    @IsOptional()
    @IsString()
    paymentTerms?: string;


    @IsNotEmpty()
    @IsIn(['10', '30', '42', '48', '1'])
    paymentMeans: string;


    @IsOptional()
    @IsString()
    specialTaxTreatment?: string;


    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    prePaymentInvoice?: boolean;


    @IsNotEmpty()
    @IsMongoId()
    businessDetailId: string;


    @IsNotEmpty()
    @IsMongoId()
    customerId: string;


    @IsNotEmpty()   
    @IsMongoId()
    bankDetailId: string;

    

    @IsNotEmpty()   
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => AddItemsDto)
    items: AddItemsDto[];

    
    @IsOptional()
    @IsString()
    totalAmountInWords?: string;
                      
    
    @IsOptional()
    @IsString()
    notes?: string;
                      


    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    AmountPaidToDate?: number;
}


export class getInvoiceListDto {
    @IsInt()
    @IsNotEmpty()
    offSet: number;


    @IsInt()
    @IsOptional()
    limit: number; 


    @IsOptional()
    @Type(() => Date)
    @IsDate()
    invoiceStartDate?: Date;


    @IsOptional()
    @Type(() => Date)
    @IsDate()
    invoiceEndDate?: Date;


    
    @IsOptional()
    @IsIn(['createdAt', 'invoiceDate'])
    sortBy: string;
        
        
        
    @IsOptional()
    @IsIn(['asc', 'desc'])
    orderBy: string;
        

    @IsOptional()
    @IsIn(['invoiceNumber', 'customerPoNumber', 'name', 'companyName', 'customerNumber'])
    searchBy: string;
        
        
    @ValidateIf((obj) => !!obj.searchBy) 
    @IsNotEmpty({ message: 'search is required when searchBy is provided' })
    search: string;
        

}


export class getInvoiceByIdDto{
    @IsNotEmpty()
    @IsMongoId()
    id: string;
}