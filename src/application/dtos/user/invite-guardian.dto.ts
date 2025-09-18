import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteGuardianDto {
  @ApiProperty({
    description: 'Email do guardião que será convidado',
    example: 'guardian@example.com',
    format: 'email',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  recipientIdentifier: string;
}
