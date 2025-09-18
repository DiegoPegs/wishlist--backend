import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email ou username do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsString()
  @IsNotEmpty()
  login: string;
}
