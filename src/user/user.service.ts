import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';

import { User } from './user.model';
import { ICreateUser } from './interfaces/create-user.interface';
import { IGetUser } from './interfaces/get-user.interface';
import { SearchUserDto } from './dto/search-user.dto';
import { SearchOptionsDto } from './dto/search-options.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async generateHash(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  async create(createUserDto: ICreateUser) {
    const password = await this.generateHash(createUserDto.password);

    return this.userModel.create({
      ...createUserDto,
      password,
    });
  }

  async updatePassword({ password, ...signData }: ICreateUser) {
    const hash = await this.generateHash(password);

    return this.userModel.update(
      {
        password: hash,
      },
      { where: signData },
    );
  }

  getUser(userData: IGetUser) {
    return this.userModel.findOne({ where: userData });
  }

  async findAll(search: SearchUserDto, options) {
    return this.userModel.findAll({
      where: search,
      attributes: ['id', 'name', 'phone', 'email', 'age'],
      ...options,
    });
  }

  findOne(id: number) {
    return this.userModel.findByPk(id, {
      attributes: ['id', 'name', 'phone', 'email', 'age'],
    });
  }

  update(id: number, updateData: any) {
    return this.userModel.update(updateData, { where: { id } });
  }

  remove(id: number) {
    return this.userModel.destroy({ where: { id } });
  }
}
