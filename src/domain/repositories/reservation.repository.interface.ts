import type { Reservation } from '../entities/reservation.entity';

export interface IReservationRepository {
  create(reservation: Reservation): Promise<Reservation>;
  findById(_id: string): Promise<Reservation | null>;
  findByItemId(itemId: string): Promise<Reservation[]>;
  findByUserId(_userId: string): Promise<Reservation[]>;
  update(_id: string, data: Partial<Reservation>): Promise<Reservation | null>;
  delete(_id: string): Promise<boolean>;
  deleteByItemId(itemId: string): Promise<boolean>;
  deleteByUserId(_userId: string): Promise<boolean>;
}
