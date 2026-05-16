import { IsIn, IsString, Length } from 'class-validator';

export class CreateSwipeDto {
  @IsString()
  @Length(10, 40)
  targetUserId!: string;

  @IsIn(['like', 'pass'])
  action!: 'like' | 'pass';
}
