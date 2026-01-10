import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CompanyStatus } from '../entities/company.entity';

export class CreateCompanyDto {
  @ApiProperty({ 
    example: 'Studio Butterfly', 
    description: 'Company name',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company_name: string;

  @ApiProperty({ 
    example: 'butterfly', 
    description: 'Subdomain for company (will be sb.butterchat.io)',
    maxLength: 50,
    minLength: 3
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  subdomain: string;

  @ApiProperty({ 
    example: 'https://example.com/logo.png', 
    description: 'Company logo URL',
    required: false,
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  logo?: string;

  @ApiProperty({ 
    example: 'https://example.com/banner.png', 
    description: 'Company banner URL',
    required: false,
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  banner?: string;

  @ApiProperty({ 
    example: 'We are a leading provider of innovative solutions', 
    description: 'Company bio/description',
    required: false,
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  bio?: string;

  @ApiProperty({ 
    example: CompanyStatus.PENDING, 
    description: 'Company status',
    enum: CompanyStatus,
    required: false,
    default: CompanyStatus.PENDING
  })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;
}