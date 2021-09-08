import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface TokenCreateAttrs {
  token: string;
  userId: number;
}

@Table({ tableName: 'Tokens' })
export class Token extends Model<Token, TokenCreateAttrs> {
  @Column({ type: DataType.STRING, primaryKey: true })
  token: string;

  @Column({ type: DataType.INTEGER })
  userId: number;
}
