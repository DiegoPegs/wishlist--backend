import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReserveItemDto } from '../../../application/dtos/reservation/reserve-item.dto';
import { ReservationsService } from './reservations.service';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../../../domain/entities/user.entity';
import { Reservation } from '../../../domain/entities/reservation.entity';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('mine')
  async getUserReservations(@GetUser() user: User): Promise<Reservation[]> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.reservationsService.getUserReservations(
      user._id.toString(),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  async confirmPurchase(
    @Param('id') reservationId: string,
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
  async cancelReservation(
    @Param('id') reservationId: string,
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
