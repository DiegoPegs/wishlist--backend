import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { GetCurrentUserUseCase } from '../../../application/use-cases/auth/get-current-user.use-case';
import { UpdateGiftingProfileUseCase } from '../../../application/use-cases/user/update-gifting-profile.use-case';
import { UpdateProfileUseCase } from '../../../application/use-cases/user/update-profile.use-case';
import { GetUserByUsernameUseCase } from '../../../application/use-cases/user/get-user-by-username.use-case';
import { CreateDependentUseCase } from '../../../application/use-cases/dependent/create-dependent.use-case';
import { AddGuardianUseCase } from '../../../application/use-cases/dependent/add-guardian.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/register-user.use-case';
import { FollowUserUseCase } from '../../../application/use-cases/user/follow-user.use-case';
import { UnfollowUserUseCase } from '../../../application/use-cases/user/unfollow-user.use-case';
import { DeactivateDependentUseCase } from '../../../application/use-cases/dependent/deactivate-dependent.use-case';
import { RestoreDependentUseCase } from '../../../application/use-cases/dependent/restore-dependent.use-case';
import { PermanentlyDeleteDependentUseCase } from '../../../application/use-cases/dependent/permanently-delete-dependent.use-case';
import { FindDependentsByGuardianUseCase } from '../../../application/use-cases/dependent/find-dependents-by-guardian.use-case';
import { FindDependentByIdUseCase } from '../../../application/use-cases/user/find-dependent-by-id.use-case';
import { FindDependentWishlistsUseCase } from '../../../application/use-cases/user/find-dependent-wishlists.use-case';
import { GetDependentWishlistsUseCase } from '../../../application/use-cases/wishlist/get-dependent-wishlists.use-case';
import { CreateDependentWishlistUseCase } from '../../../application/use-cases/wishlist/create-dependent-wishlist.use-case';
import { RemoveGuardianshipUseCase } from '../../../application/use-cases/user/remove-guardianship.use-case';
import { MongoUserRepository } from '../../database/repositories/mongo.user.repository';
import { MongoInvitationRepository } from '../../database/repositories/mongo.invitation.repository';
import { MongoWishlistRepository } from '../../database/repositories/mongo.wishlist.repository';
import { MongoItemRepository } from '../../database/repositories/mongo.item.repository';
import { MongoReservationRepository } from '../../database/repositories/mongo.reservation.repository';
import { MongoConversationRepository } from '../../database/repositories/mongo.conversation.repository';
import { MongoMessageRepository } from '../../database/repositories/mongo.message.repository';
import { User, UserSchema } from '../../database/schemas/user.schema';
import {
  Invitation,
  InvitationSchema,
} from '../../database/schemas/invitation.schema';
import {
  Wishlist,
  WishlistSchema,
} from '../../database/schemas/wishlist.schema';
import { Item, ItemSchema } from '../../database/schemas/item.schema';
import {
  Reservation,
  ReservationSchema,
} from '../../database/schemas/reservation.schema';
import {
  Conversation,
  ConversationSchema,
} from '../../database/schemas/conversation.schema';
import { Message, MessageSchema } from '../../database/schemas/message.schema';
import { EmailService } from '../../services/email.service';
import { CognitoService } from '../../services/cognito.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Invitation.name, schema: InvitationSchema },
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    GetCurrentUserUseCase,
    UpdateGiftingProfileUseCase,
    UpdateProfileUseCase,
    GetUserByUsernameUseCase,
    CreateDependentUseCase,
    AddGuardianUseCase,
    RegisterUserUseCase,
    FollowUserUseCase,
    UnfollowUserUseCase,
    DeactivateDependentUseCase,
    RestoreDependentUseCase,
    PermanentlyDeleteDependentUseCase,
          FindDependentsByGuardianUseCase,
          FindDependentByIdUseCase,
          FindDependentWishlistsUseCase,
          GetDependentWishlistsUseCase,
    CreateDependentWishlistUseCase,
    RemoveGuardianshipUseCase,
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
    {
      provide: 'IInvitationRepository',
      useClass: MongoInvitationRepository,
    },
    {
      provide: 'IWishlistRepository',
      useClass: MongoWishlistRepository,
    },
    {
      provide: 'IItemRepository',
      useClass: MongoItemRepository,
    },
    {
      provide: 'IReservationRepository',
      useClass: MongoReservationRepository,
    },
    {
      provide: 'IConversationRepository',
      useClass: MongoConversationRepository,
    },
    {
      provide: 'IMessageRepository',
      useClass: MongoMessageRepository,
    },
    {
      provide: 'IEmailService',
      useClass: EmailService,
    },
    CognitoService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
