import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Reservation as ReservationSchema,
  ReservationDocument,
} from '../schemas/reservation.schema';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import { safeToString } from '../utils/type-guards';

@Injectable()
export class MongoReservationRepository implements IReservationRepository {
  constructor(
    @InjectModel(ReservationSchema.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async create(reservation: Reservation): Promise<Reservation> {
    try {
      const createdReservation = new this.reservationModel(reservation);
      const savedReservation = await createdReservation.save();
      return this.toDomain(savedReservation.toObject());
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while creating reservation');
    }
  }

  async findById(_id: string): Promise<Reservation | null> {
    try {
      const reservation = await this.reservationModel.findById(_id).lean().exec();
      return reservation ? this.toDomain(reservation as any) : null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred while finding reservation by ID',
      );
    }
  }

  async findByItemId(itemId: string): Promise<Reservation[]> {
    try {
      const reservations = await this.reservationModel
        .find({ itemId: itemId })
        .lean()
        .exec();
      return reservations.map((reservation) => this.toDomain(reservation as any));
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred while finding reservations by item ID',
      );
    }
  }

  async findByUserId(_userId: string): Promise<Reservation[]> {
    try {
      const reservations = await this.reservationModel
        .find({ reservedByUserId: _userId })
        .lean()
        .exec();
      return reservations.map((reservation) => this.toDomain(reservation as any));
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred while finding reservations by user ID',
      );
    }
  }

  async update(
    _id: string,
    data: Partial<Reservation>,
  ): Promise<Reservation | null> {
    try {
      const updatedReservation = await this.reservationModel
        .findByIdAndUpdate(_id, data, { new: true })
        .lean()
        .exec();
      return updatedReservation ? this.toDomain(updatedReservation as any) : null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while updating reservation');
    }
  }

  async delete(_id: string): Promise<boolean> {
    try {
      const result = await this.reservationModel.findByIdAndDelete(_id).exec();
      return !!result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while deleting reservation');
    }
  }

  async deleteByItemId(itemId: string): Promise<boolean> {
    try {
      const result = await this.reservationModel
        .deleteMany({ itemId: itemId })
        .exec();
      return result.deletedCount > 0;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred while deleting reservations by item ID',
      );
    }
  }

  async deleteByUserId(_userId: string): Promise<boolean> {
    try {
      const result = await this.reservationModel
        .deleteMany({ reservedByUserId: _userId })
        .exec();
      return result.deletedCount > 0;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred while deleting reservations by user ID',
      );
    }
  }

  private toDomain(reservationDocument: ReservationDocument): Reservation {
    const reservation = new Reservation();
    reservation._id = safeToString(reservationDocument._id);
    reservation.itemId = safeToString(reservationDocument.itemId);
    reservation.wishlistId = safeToString(reservationDocument.wishlistId);
    reservation.reservedByUserId = safeToString(
      reservationDocument.reservedByUserId,
    );
    reservation.wishlistOwnerId = safeToString(
      reservationDocument.wishlistOwnerId,
    );
    reservation.quantity = reservationDocument.quantity;
    reservation.status = reservationDocument.status;
    reservation.createdAt = reservationDocument.createdAt;
    return reservation;
  }
}