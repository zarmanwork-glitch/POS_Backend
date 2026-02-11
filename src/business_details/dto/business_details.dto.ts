import { IsNotEmpty, IsString, IsOptional, IsInt, IsEmail, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { EnumIdentificationType } from 'src/shared/enums';



export class CreateBusinessDetailsDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    

    @IsNotEmpty()
    @IsString()
    companyName: string;


    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;


    @IsOptional()
    @IsString()
    companyNameLocal?: string;


    @IsNotEmpty()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isVatRegistered: boolean;


    @IsOptional()
    @IsString()
    addressStreet?: string;


    @IsOptional()
    @IsString()
    addressStreetAdditional?: string;


    @IsNotEmpty()
    @IsString()
    buildingNumber: string;


    @IsNotEmpty()
    @IsString()
    country: string;


    @IsOptional()
    @IsString()
    province?: string;


    @IsNotEmpty()
    @IsString()
    city: string;


    @IsNotEmpty()
    @IsString()
    district: string;


    @IsNotEmpty()
    @IsString()
    postalCode: string;


    @IsOptional()
    @IsString()
    additionalNumber?: string;


    @IsOptional()
    @IsString()
    addressLocal?: string;


    @IsNotEmpty()
    @IsString()
    companyRegistrationNumber: string;

    
    @IsNotEmpty()
    @IsString()
    vatNumber: string;


    @IsOptional()
    @IsString()
    groupVatNumber?: string;


    @IsNotEmpty()
    @IsEnum(EnumIdentificationType)
    identificationType: EnumIdentificationType;


    @IsNotEmpty()
    @IsString()
    identificationNumber: string;


    @IsOptional()
    @IsString()
    refundPolicy?: string;


    @IsOptional()
    @IsString()
    refundPolicyLocal?: string;
}


export class getBusinessDetailsDto {
    @IsInt()
    @IsNotEmpty()
    offSet: number;


    @IsInt()
    @IsOptional()
    limit: number; 
}


export class UpdateBusinessDetailsDto {
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
    email?: string;

    
    @IsOptional()
    @IsString()
    phoneNumber?: string;


    @IsOptional()
    @IsString()
    companyNameLocal?: string;


    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isVatRegistered?: boolean;


    @IsOptional()
    @IsString()
    addressStreet?: string;


    @IsOptional()
    @IsString()
    addressStreetAdditional?: string;


    @IsOptional()
    @IsString()
    buildingNumber?: string;


    @IsOptional()
    @IsString()
    country?: string;


    @IsOptional()
    @IsString()
    province?: string;


    @IsOptional()
    @IsString()
    city?: string;


    @IsOptional()
    @IsString()
    district?: string;


    @IsOptional()
    @IsString()
    postalCode?: string;


    @IsOptional()
    @IsString()
    additionalNumber?: string;


    @IsOptional()
    @IsString()
    addressLocal?: string;


    @IsOptional()
    @IsString()
    companyRegistrationNumber?: string;

    
    @IsOptional()
    @IsString()
    vatNumber?: string;


    @IsOptional()
    @IsString()
    groupVatNumber?: string;


    @IsOptional()
    @IsEnum(EnumIdentificationType)
    identificationType?: EnumIdentificationType;


    @IsOptional()
    @IsString()
    identificationNumber?: string;

    
    @IsOptional()
    @IsString()
    refundPolicy?: string;


    @IsOptional()
    @IsString()
    refundPolicyLocal?: string;
}


export class businessDetailsByIdDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}
