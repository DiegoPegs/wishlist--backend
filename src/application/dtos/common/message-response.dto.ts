import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Mensagem de resposta da operação',
    example: 'Operação realizada com sucesso',
    type: 'string',
  })
  message: string;
}
