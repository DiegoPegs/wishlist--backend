import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './infrastructure/controllers/auth/guards/jwt-auth.guard';
import { AppController } from './infrastructure/controllers/app/app.controller';
import { AppService } from './infrastructure/services/app.service';
import { ConfigValidationService } from './infrastructure/services/config-validation.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './infrastructure/controllers/auth/auth.module';
import { WishlistsModule } from './infrastructure/controllers/wishlists/wishlists.module';
import { UsersModule } from './infrastructure/controllers/users/users.module';
import { ItemsModule } from './infrastructure/controllers/items/items.module';
import { ReservationsModule } from './infrastructure/controllers/reservations/reservations.module';
import { ConversationsModule } from './infrastructure/controllers/conversations/conversations.module';
import { PublicModule } from './infrastructure/controllers/public/public.module';
import { InvitationsModule } from './infrastructure/controllers/invitations/invitations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    WishlistsModule,
    UsersModule,
    ItemsModule,
    ReservationsModule,
    ConversationsModule,
    PublicModule,
    InvitationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigValidationService,
    // --- INÍCIO DA CONFIGURAÇÃO DO GUARD GLOBAL ---
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // --- FIM DA CONFIGURAÇÃO DO GUARD GLOBAL ---
  ],
})
export class AppModule {}
