import { IsNotEmpty, IsString, IsOptional, IsInt, IsEmail, IsEnum, ValidateIf, IsIn } from 'class-validator';
import { EnumCustomerIdentificationType } from 'src/shared/enums';



const ID_BASED_TYPES = [
  EnumCustomerIdentificationType.NATIONAL_ID,
  EnumCustomerIdentificationType.TAX_IDENTIFICATION_NO,
  EnumCustomerIdentificationType.IQAMA_NUMBER,
  EnumCustomerIdentificationType.PASSPORT_ID,
];


const SPECIAL_TYPES = [
  EnumCustomerIdentificationType.SEVEN_HUNDRED_NUMBER,
  EnumCustomerIdentificationType.COMMERCIAL_REGISTRATION_NUMBER,
  EnumCustomerIdentificationType.MOMRA_LICENSE,
  EnumCustomerIdentificationType.MLSD_LICENSE,
  EnumCustomerIdentificationType.SAGIA_LICENSE,
  EnumCustomerIdentificationType.GCC_ID,
  EnumCustomerIdentificationType.MINISTRY_OF_JUSTICE_LICENSE,
  EnumCustomerIdentificationType.OTHER_ID,
  EnumCustomerIdentificationType.COMPANY_REGISTRATION
];



export class CreateCustomersDto {
    @IsOptional()
    @IsString()
    name?: string;
    

    @IsNotEmpty()
    @IsString()
    companyName: string;


    
    @IsOptional()
    @IsString()
    customerNumber?: string;


    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;


    @IsOptional()
    @IsString()
    companyNameLocal?: string;



    @IsNotEmpty()
    @IsString()
    addressStreet: string;


    @IsOptional()
    @IsString()
    addressStreetAdditional?: string;



    @IsNotEmpty()
    @IsString()
    country: string;


    @IsOptional()
    @IsString()
    province?: string;



    @IsNotEmpty()
    @IsString()
    district: string;


    @IsNotEmpty()
    @IsString()
    postalCode: string;


    @IsOptional()
    @IsString()
    addressLocal?: string;


    @IsNotEmpty()
    @IsString()
    buildingNumber: string;


    @IsNotEmpty()
    @IsString()
    city: string;



    @IsOptional()
    @IsString()
    neighborhood?: string


    @IsOptional()
    @IsString()
    companyRegistrationNumber?: string;


    @IsNotEmpty()
    @IsEnum(EnumCustomerIdentificationType)
    identificationType: EnumCustomerIdentificationType;



    @ValidateIf(o => ID_BASED_TYPES.includes(o.identificationType))  
    @ValidateIf(o => (
            (ID_BASED_TYPES.includes(o.identificationType) && !o.vatNumber) ||
            (SPECIAL_TYPES.includes(o.identificationType) && !o.groupVatNumber) 
        )
    )
    @IsNotEmpty()
    @IsString()
    identificationNumber: string;



    @ValidateIf(o => !SPECIAL_TYPES.includes(o.identificationType) && 
        !(
            ID_BASED_TYPES.includes(o.identificationType) &&
            o.identificationNumber 
        )
    )
    @IsNotEmpty()
    @IsString()
    vatNumber: string;


    
    @ValidateIf(o => !(
            SPECIAL_TYPES.includes(o.identificationType) &&
            o.identificationNumber
        )
    )
    @IsNotEmpty()
    @IsString()
    groupVatNumber: string;
   
}


export class getCustomerDetailsDto {
    @IsInt()
    @IsNotEmpty()
    offSet: number;


    @IsInt()
    @IsOptional()
    limit: number; 


    
    @IsOptional()
    @IsIn(['chronological', 'name', 'companyName'])
    sortBy: string;
    
    
    
    @IsOptional()
    @IsIn(['asc', 'desc'])
    orderBy: string;
    
    
    @IsOptional()
    @IsIn(['name', 'companyName', 'email', 'phoneNumber', 'customerNumber'])
    searchBy: string;
    
    
    @ValidateIf((obj) => !!obj.searchBy) 
    @IsNotEmpty({ message: 'search is required when searchBy is provided' })
    search: string;
    
}


export class UpdateCustomerDto {
    @IsNotEmpty()
    @IsString()
    id: string;


    @IsOptional()
    @IsString()
    name?: string;
    

    @IsOptional()
    @IsString()
    companyName?: string;


    
    @IsOptional()
    @IsString()
    customerNumber?: string;


    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    
    @IsOptional()
    @IsString()
    phoneNumber?: string;


    @IsOptional()
    @IsString()
    companyNameLocal?: string;



    @IsOptional()
    @IsString()
    addressStreet?: string;


    @IsOptional()
    @IsString()
    addressStreetAdditional?: string;



    @IsOptional()
    @IsString()
    country?: string;


    @IsOptional()
    @IsString()
    province?: string;



    @IsOptional()
    @IsString()
    district?: string;


    @IsOptional()
    @IsString()
    postalCode?: string;


    @IsOptional()
    @IsString()
    addressLocal?: string;


    @IsOptional()
    @IsString()
    buildingNumber?: string;


    @IsOptional()
    @IsString()
    city?: string;



    @IsOptional()
    @IsString()
    neighborhood?: string


    @IsOptional()
    @IsString()
    companyRegistrationNumber?: string;


    
    @IsOptional()
    @IsEnum(EnumCustomerIdentificationType)
    identificationType: EnumCustomerIdentificationType;



    @ValidateIf(o => ID_BASED_TYPES.includes(o.identificationType))  
    @ValidateIf(o => (
            (ID_BASED_TYPES.includes(o.identificationType) && !o.vatNumber) ||
            (SPECIAL_TYPES.includes(o.identificationType) && !o.groupVatNumber) 
        )
    )
    @IsOptional()
    @IsString()
    identificationNumber: string;



    @ValidateIf(o => !SPECIAL_TYPES.includes(o.identificationType) && 
        !(
            ID_BASED_TYPES.includes(o.identificationType) &&
            o.identificationNumber 
        )
    )
    @IsOptional()
    @IsString()
    vatNumber: string;


    
    @ValidateIf(o => !(
            SPECIAL_TYPES.includes(o.identificationType) &&
            o.identificationNumber
        )
    )
    @IsOptional()
    @IsString()
    groupVatNumber: string;
}


export class customerDetailsByIdDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}
