import type { Invitation } from '../entities/invitation.entity';

export interface IInvitationRepository {
  create(invitation: Invitation): Promise<Invitation>;
  findByToken(_token: string): Promise<Invitation | null>;
  update(_id: string, data: Partial<Invitation>): Promise<Invitation | null>;
}
