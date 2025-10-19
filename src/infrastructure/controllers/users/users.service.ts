import { Injectable, Inject } from '@nestjs/common';
import { UpdateGiftingProfileDto } from '../../../application/dtos/user/update-gifting-profile.dto';
import { UpdateProfileDto } from '../../../application/dtos/user/update-profile.dto';
import { UpdateLanguageDto } from '../../../application/dtos/user/update-language.dto';
import { CreateDependentDto } from '../../../application/dtos/user/create-dependent.dto';
import { AddGuardianDto } from '../../../application/dtos/user/add-guardian.dto';
import { CreateDependentWishlistDto } from '../../../application/dtos/wishlist/create-dependent-wishlist.dto';
import { GetCurrentUserUseCase } from '../../../application/use-cases/auth/get-current-user.use-case';
import { UpdateGiftingProfileUseCase } from '../../../application/use-cases/user/update-gifting-profile.use-case';
import { UpdateProfileUseCase } from '../../../application/use-cases/user/update-profile.use-case';
import { UpdateLanguageUseCase } from '../../../application/use-cases/user/update-language.use-case';
import { GetUserByUsernameUseCase } from '../../../application/use-cases/user/get-user-by-username.use-case';
import { CreateDependentUseCase } from '../../../application/use-cases/dependent/create-dependent.use-case';
import { AddGuardianUseCase } from '../../../application/use-cases/dependent/add-guardian.use-case';
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
import { User } from '../../../domain/entities/user.entity';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { WishlistWithItemsResponseDto } from '../../../application/dtos/wishlist/wishlist-with-items-response.dto';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateGiftingProfileUseCase: UpdateGiftingProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly updateLanguageUseCase: UpdateLanguageUseCase,
    private readonly getUserByUsernameUseCase: GetUserByUsernameUseCase,
    private readonly createDependentUseCase: CreateDependentUseCase,
    private readonly addGuardianUseCase: AddGuardianUseCase,
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly unfollowUserUseCase: UnfollowUserUseCase,
    private readonly deactivateDependentUseCase: DeactivateDependentUseCase,
    private readonly restoreDependentUseCase: RestoreDependentUseCase,
    private readonly permanentlyDeleteDependentUseCase: PermanentlyDeleteDependentUseCase,
          private readonly findDependentsByGuardianUseCase: FindDependentsByGuardianUseCase,
          private readonly findDependentByIdUseCase: FindDependentByIdUseCase,
          private readonly findDependentWishlistsUseCase: FindDependentWishlistsUseCase,
          private readonly getDependentWishlistsUseCase: GetDependentWishlistsUseCase,
    private readonly createDependentWishlistUseCase: CreateDependentWishlistUseCase,
    private readonly removeGuardianshipUseCase: RemoveGuardianshipUseCase,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async getCurrentUser(_userId: string): Promise<User> {
    return this.getCurrentUserUseCase.execute(_userId);
  }

  async updateGiftingProfile(
    _userId: string,
    updateGiftingProfileDto: UpdateGiftingProfileDto,
  ): Promise<User> {
    return this.updateGiftingProfileUseCase.execute(
      _userId,
      updateGiftingProfileDto,
    );
  }

  async updateProfile(
    _userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.updateProfileUseCase.execute(_userId, updateProfileDto);
  }

  async updateLanguage(
    _userId: string,
    updateLanguageDto: UpdateLanguageDto,
  ): Promise<User> {
    return this.updateLanguageUseCase.execute(_userId, updateLanguageDto);
  }

  async getUserByUsername(_username: string): Promise<User> {
    return this.getUserByUsernameUseCase.execute(_username);
  }

  async createDependent(
    createDependentDto: CreateDependentDto,
    guardianId: string,
  ): Promise<User> {
    return this.createDependentUseCase.execute(createDependentDto, guardianId);
  }

  async addGuardian(
    _dependentId: string,
    addGuardianDto: AddGuardianDto,
    guardianId: string,
  ): Promise<{ message: string }> {
    await this.addGuardianUseCase.execute(
      _dependentId,
      addGuardianDto.newGuardianId,
      guardianId,
    );
    return { message: 'Guardião adicionado com sucesso' };
  }

  async followUser(
    _username: string,
    _currentUserId: string,
  ): Promise<{ message: string }> {
    // Primeiro, buscar o usuário pelo username para obter o ID
    const userToFollow = await this.getUserByUsernameUseCase.execute(_username);
    if (!userToFollow._id) {
      throw new Error('User ID not found');
    }

    await this.followUserUseCase.execute(
      userToFollow._id.toString(),
      _currentUserId,
    );
    return { message: `Agora você está seguindo ${_username}` };
  }

  async unfollowUser(
    _username: string,
    _currentUserId: string,
  ): Promise<{ message: string }> {
    // Primeiro, buscar o usuário pelo username para obter o ID
    const userToUnfollow =
      await this.getUserByUsernameUseCase.execute(_username);
    if (!userToUnfollow._id) {
      throw new Error('User ID not found');
    }

    await this.unfollowUserUseCase.execute(
      userToUnfollow._id.toString(),
      _currentUserId,
    );
    return { message: `Você deixou de seguir ${_username}` };
  }

  async getFollowers(_username: string): Promise<User[]> {
    const user = await this.getUserByUsernameUseCase.execute(_username);
    if (!user._id) {
      throw new Error('User ID not found');
    }

    // Buscar os seguidores do usuário (incluindo inativos)
    if (!user.followers || user.followers.length === 0) {
      return [];
    }

    const followerIds = user.followers.map((id) => id.toString());
    return await this.userRepository.findDependentsIncludingInactive(
      followerIds,
    );
  }

  async getFollowing(_username: string): Promise<User[]> {
    const user = await this.getUserByUsernameUseCase.execute(_username);
    if (!user._id) {
      throw new Error('User ID not found');
    }

    // Buscar quem o usuário segue (incluindo inativos)
    if (!user.following || user.following.length === 0) {
      return [];
    }

    const followingIds = user.following.map((id) => id.toString());
    return await this.userRepository.findDependentsIncludingInactive(
      followingIds,
    );
  }

  async deactivateDependent(
    _dependentId: string,
    _requesterId: string,
  ): Promise<{ message: string }> {
    return await this.deactivateDependentUseCase.execute(
      _dependentId,
      _requesterId,
    );
  }

  async restoreDependent(
    _dependentId: string,
    _requesterId: string,
  ): Promise<{ message: string }> {
    return await this.restoreDependentUseCase.execute(
      _dependentId,
      _requesterId,
    );
  }

  async permanentlyDeleteDependent(
    _dependentId: string,
    _requesterId: string,
  ): Promise<{ message: string }> {
    return await this.permanentlyDeleteDependentUseCase.execute(
      _dependentId,
      _requesterId,
    );
  }

  async getDependentsByGuardian(
    guardianId: string,
    status?: 'ACTIVE' | 'INACTIVE',
  ): Promise<User[]> {
    return await this.findDependentsByGuardianUseCase.execute(
      guardianId,
      status,
    );
  }

  async findDependentById(
    dependentId: string,
    requesterId: string,
  ): Promise<User> {
    return await this.findDependentByIdUseCase.execute(
      dependentId,
      requesterId,
    );
  }

  async findDependentWishlists(
    dependentId: string,
    requesterId: string,
  ): Promise<Wishlist[]> {
    return await this.findDependentWishlistsUseCase.execute(
      dependentId,
      requesterId,
    );
  }

  async getDependentWishlists(
    dependentId: string,
    requesterId: string,
  ): Promise<WishlistWithItemsResponseDto[]> {
    return await this.getDependentWishlistsUseCase.execute(
      dependentId,
      requesterId,
    );
  }

  async createDependentWishlist(
    createDependentWishlistDto: CreateDependentWishlistDto,
    dependentId: string,
    requesterId: string,
  ): Promise<Wishlist> {
    return await this.createDependentWishlistUseCase.execute(
      createDependentWishlistDto,
      dependentId,
      requesterId,
    );
  }

  async removeGuardianship(
    dependentId: string,
    requesterId: string,
  ): Promise<void> {
    return await this.removeGuardianshipUseCase.execute(
      dependentId,
      requesterId,
    );
  }
}
