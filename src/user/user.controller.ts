import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/updte-user.dto';
import { GetUser } from './user.decorator';
import { UserService } from './user.service';
import { SearchUserDto } from './dto/search-user.dto';
import { SearchOptionsDto } from './dto/search-options.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @Put()
  @UseGuards(AuthGuard)
  update(@GetUser('userId') userId, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Get()
  findAll(@Query() searchOptions: SearchOptionsDto): Promise<SearchUserDto[]> {
    const { limit, offset, ...searchUser } = searchOptions;

    return this.usersService.findAll(searchUser, { limit, offset });
  }
}
