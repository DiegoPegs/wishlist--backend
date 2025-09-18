import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email ou username do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    description: 'Código de recuperação enviado por email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  recoveryCode: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'minhanovasenha456',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
