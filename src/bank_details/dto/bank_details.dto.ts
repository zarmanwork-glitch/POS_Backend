import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';


export class CreateBankDetailsDto {
    @IsNotEmpty()
    @IsString()
    country: string;

    
    @IsNotEmpty()
    @IsString()
    accountNumber: string;


    @IsNotEmpty()
    @IsString()
    iban: string;

  
    @IsNotEmpty()
    @IsString()
    bankName: string;


    @IsNotEmpty()
    @IsString()
    swiftCode: string;


    @IsOptional()
    @IsString()
    beneficiaryName?: string;
}


export class getBankDetailsDto {
    @IsInt()
    @IsNotEmpty()
    offSet: number;


    @IsInt()
    @IsOptional()
    limit: number; 
}


export class UpdateBankDetailsDto {
    @IsNotEmpty()
    @IsString()
    id: string;


    @IsOptional()
    @IsString()
    country?: string;


    @IsOptional()
    @IsString()
    accountNumber?: string;


    @IsOptional()
    @IsString()
    iban?: string;

  
    @IsOptional()
    @IsString()
    bankName?: string;


    @IsOptional()
    @IsString()
    swiftCode?: string;


    @IsOptional()
    @IsString()
    beneficiaryName?: string;
}


export class bankDetailsByIdDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}
