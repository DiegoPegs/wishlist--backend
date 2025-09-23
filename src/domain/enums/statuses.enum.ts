// src/domain/enums/statuses.enum.ts

export enum ReservationStatus {
  RESERVED = 'RESERVED',
  PURCHASED = 'PURCHASED',
  GIFTED = 'GIFTED',
  RECEIVED = 'RECEIVED',
  CANCELED = 'CANCELED',
}

export enum WishlistStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}

export enum SecretSantaGroupStatus {
  DRAW_PENDING = 'DRAW_PENDING',
  ACTIVE = 'ACTIVE',
  REVEALED = 'REVEALED',
}
