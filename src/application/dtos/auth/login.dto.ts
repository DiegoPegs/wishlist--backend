import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email ou nome de usuário para login',
    example: 'joao@example.com',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'minhasenha123',
    type: 'string',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
