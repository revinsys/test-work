import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { SearchUserDto } from './search-user.dto';

export class SearchOptionsDto extends SearchUserDto {
  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}
