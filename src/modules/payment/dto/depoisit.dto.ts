import { IsInt, Min } from 'class-validator';

export class DepositDto {
  @IsInt()
  @Min(10)
  amount: number;
}
