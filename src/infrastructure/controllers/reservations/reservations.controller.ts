import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParseMongoIdPipe } from '../../pipes/parse-mongo-id.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReserveItemDto } from '../../../application/dtos/reservation/reserve-item.dto';
import { UpdateReservationQuantityDto } from '../../../application/dtos/reservation/update-reservation-quantity.dto';
import { ReservationsService } from './reservations.service';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../../../domain/entities/user.entity';
import { Reservation } from '../../../domain/entities/reservation.entity';

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('mine')
  @ApiOperation({
    summary: 'Listar minhas reservas',
    description: 'Retorna todas as reservas do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reservas do usuário',
    type: [Reservation],
  })
  async getUserReservations(@GetUser() user: User): Promise<Reservation[]> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.reservationsService.getUserReservations(
      user._id.toString(),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar reserva específica',
    description: 'Retorna uma reserva específica do usuário logado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da reserva',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Reserva encontrada',
    type: Reservation,
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para ver esta reserva',
  })
  async getReservation(
    @Param('id', ParseMongoIdPipe) reservationId: string,
    @GetUser() user: User,
  ): Promise<Reservation> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.reservationsService.getReservation(
      reservationId,
      user._id.toString(),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar quantidade da reserva',
    description:
      'Permite alterar a quantidade de itens reservados sem cancelar a reserva',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da reserva',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Quantidade da reserva atualizada com sucesso',
    type: Reservation,
  })
  @ApiResponse({
    status: 400,
    description: 'Quantidade inválida ou insuficiente disponível',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para atualizar esta reserva',
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva não encontrada',
  })
  async updateReservationQuantity(
    @Param('id', ParseMongoIdPipe) reservationId: string,
    @GetUser() user: User,
    @Body() updateReservationQuantityDto: UpdateReservationQuantityDto,
  ): Promise<Reservation> {
    if (!user._id) {
      throw new Error('User ID not found');
    }

    return await this.reservationsService.updateReservationQuantity(
      reservationId,
      updateReservationQuantityDto,
      user._id.toString(),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova reserva',
    description: 'Cria uma nova reserva de item para o usuário logado',
  })
  @ApiResponse({
    status: 201,
    description: 'Reserva criada com sucesso',
    type: Reservation,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou quantidade insuficiente disponível',
  })
  @ApiResponse({
    status: 404,
    description: 'Item não encontrado',
  })
  async createReservation(
    @GetUser() user: User,
    @Body() reserveItemDto: ReserveItemDto,
  ): Promise<Reservation> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.reservationsService.createReservation(
      reserveItemDto,
      user._id.toString(),
    );
  }

  @Post(':id/confirm-purchase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar compra da reserva',
    description:
      'Confirma a compra de um item reservado, marcando a reserva como confirmada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da reserva a ser confirmada',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Compra confirmada com sucesso',
    type: Reservation,
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para confirmar esta reserva',
  })
  async confirmPurchase(
    @Param('id', ParseMongoIdPipe) reservationId: string,
    @GetUser() user: User,
  ): Promise<Reservation> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.reservationsService.confirmPurchase(
      reservationId,
      user._id.toString(),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar reserva',
    description: 'Cancela uma reserva específica do usuário logado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da reserva a ser cancelada',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Reserva cancelada com sucesso',
    type: Reservation,
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para cancelar esta reserva',
  })
  async cancelReservation(
    @Param('id', ParseMongoIdPipe) reservationId: string,
    @GetUser() user: User,
  ): Promise<Reservation> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.reservationsService.cancelReservation(
      reservationId,
      user._id.toString(),
    );
  }
}
