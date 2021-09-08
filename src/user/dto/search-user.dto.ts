import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { UpdateUserDto } from './updte-user.dto';

export class SearchUserDto extends UpdateUserDto {
  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  id?: number;
}
