import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsArray,
  IsOptional,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Pro' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 50, description: 'Maximum number of users' })
  @IsNumber()
  @Min(1)
  maxUsers!: number;

  @ApiProperty({ example: ['feature_a', 'feature_b'] })
  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @ApiPropertyOptional({ example: 'price_abc123' })
  @IsOptional()
  @IsString()
  stripePriceId?: string;
}
