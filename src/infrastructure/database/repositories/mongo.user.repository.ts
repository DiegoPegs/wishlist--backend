import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User as UserSchema, UserDocument } from '../schemas/user.schema';
import { User } from '../../../domain/entities/user.entity';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { safeToString, safeToStringArray } from '../utils/type-guards';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserDocument>,
  ) {}
  async addDependent(guardianId: string, dependentId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(guardianId, {
      $addToSet: { dependents: dependentId },
    });
  }

  async addGuardian(dependentId: string, guardianId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(dependentId, {
      $addToSet: { guardianIds: guardianId },
    });
  }

  async create(user: User): Promise<User> {
    // Para dependentes, remover completamente username, email e password
    const userData: Partial<UserDocument> = {
      name: user.name,
      birthDate: user.birthDate,
      isDependent: user.isDependent,
      status: user.status || UserStatus.ACTIVE,
      language: user.language,
      guardianIds: user.guardianIds || [], // Manter como string[]
      dependents: user.dependents || [], // Manter como string[]
      giftingProfile: user.giftingProfile || {},
      followers: user.followers || [], // Manter como string[]
      following: user.following || [], // Manter como string[]
    };

    // Apenas adicionar credenciais se não for dependente
    if (!user.isDependent) {
      userData.username = user.username;
      userData.email = user.email;
      userData.password = user.password;
    }

    const createdUser = new this.userModel(userData);
    const savedUser = await createdUser.save();
    return this.toDomain(savedUser.toObject());
  }

  async findById(_id: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        _id: _id,
        status: UserStatus.ACTIVE,
      })
      .lean()
      .exec();
    return user ? this.toDomain(user as any) : null;
  }

  async findByIdIncludingInactive(_id: string): Promise<User | null> {
    const user = await this.userModel.findById(_id).lean().exec();
    return user ? this.toDomain(user as any) : null;
  }

  async findByEmail(_email: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        email: _email,
        status: UserStatus.ACTIVE,
      })
      .lean()
      .exec();
    return user ? this.toDomain(user as any) : null;
  }

  async findByUsername(_username: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        username: _username,
        status: UserStatus.ACTIVE,
      })
      .lean()
      .exec();
    return user ? this.toDomain(user as any) : null;
  }

  // Métodos específicos para autenticação (incluem usuários inativos)
  async findByEmailForAuth(_email: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({ email: _email })
      .select('+password')
      .lean()
      .exec();
    return user ? this.toDomain(user as any) : null;
  }

  async findByUsernameForAuth(_username: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({ username: _username })
      .select('+password')
      .lean()
      .exec();
    return user ? this.toDomain(user as any) : null;
  }

  async findByLogin(login: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        $or: [{ email: login }, { username: login }],
      })
      .lean()
      .exec();
    return user ? this.toDomain(user as any) : null;
  }

  async findByLoginWithPassword(login: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        $or: [{ email: login }, { username: login }],
        status: UserStatus.ACTIVE,
      })
      .select('+password')
      .lean()
      .exec();
    return user ? this.toDomain(user as any) : null;
  }

  async findByIds(_ids: string[]): Promise<User[]> {
    const users = await this.userModel
      .find({
        _id: { $in: _ids },
        status: UserStatus.ACTIVE,
      })
      .lean()
      .exec();
    return users.map((user) => this.toDomain(user as any));
  }

  // Método para buscar dependentes incluindo inativos
  async findDependentsIncludingInactive(_ids: string[]): Promise<User[]> {
    const users = await this.userModel
      .find({
        _id: { $in: _ids },
      })
      .lean()
      .exec();
    return users.map((user) => this.toDomain(user as any));
  }

  async update(_id: string, data: Partial<User>): Promise<User | null> {
    // Para objetos aninhados como giftingProfile, usar $set com notação de ponto
    const updateData: Record<string, unknown> = {};
    Object.keys(data).forEach((key) => {
      if (key === 'giftingProfile' && data.giftingProfile) {
        Object.keys(data.giftingProfile).forEach((profileKey) => {
          updateData[`giftingProfile.${profileKey}`] =
            data.giftingProfile![
              profileKey as keyof typeof data.giftingProfile
            ];
        });
      } else {
        updateData[key] = data[key as keyof User];
      }
    });

    const updatedUser = await this.userModel
      .findByIdAndUpdate(_id, { $set: updateData }, { new: true })
      .lean()
      .exec();
    return updatedUser ? this.toDomain(updatedUser as any) : null;
  }

  async delete(_id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(_id).exec();
    return !!result;
  }

  async addFollower(
    _userIdToFollow: string,
    _currentUserId: string,
  ): Promise<void> {
    // Adicionar o usuário atual aos followers do usuário que está sendo seguido
    await this.userModel
      .findByIdAndUpdate(
        _userIdToFollow,
        { $addToSet: { followers: _currentUserId } },
        { new: true },
      )
      .exec();

    // Adicionar o usuário que está sendo seguido aos following do usuário atual
    await this.userModel
      .findByIdAndUpdate(
        _currentUserId,
        { $addToSet: { following: _userIdToFollow } },
        { new: true },
      )
      .exec();
  }

  async removeFollower(
    _userIdToUnfollow: string,
    _currentUserId: string,
  ): Promise<void> {
    // Remover o usuário atual dos followers do usuário que está sendo deixado de seguir
    await this.userModel
      .findByIdAndUpdate(
        _userIdToUnfollow,
        { $pull: { followers: _currentUserId } },
        { new: true },
      )
      .exec();

    // Remover o usuário que está sendo deixado de seguir dos following do usuário atual
    await this.userModel
      .findByIdAndUpdate(
        _currentUserId,
        { $pull: { following: _userIdToUnfollow } },
        { new: true },
      )
      .exec();
  }

  async removeDependent(
    _guardianId: string,
    _dependentId: string,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(
        _guardianId,
        { $pull: { dependents: _dependentId } },
        { new: true },
      )
      .exec();
  }

  async removeGuardian(
    _dependentId: string,
    _guardianId: string,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(
        _dependentId,
        { $pull: { guardianIds: _guardianId } },
        { new: true },
      )
      .exec();
  }

  private toDomain(userDocument: UserDocument): User {
    const user = new User();
    user._id = safeToString(userDocument._id);
    user.username = userDocument.username;
    user.email = userDocument.email;
    user.password = userDocument.password;
    user.name = userDocument.name;
    user.birthDate = userDocument.birthDate;
    user.isDependent = userDocument.isDependent;
    user.status = userDocument.status;
    user.language = userDocument.language;
    user.guardianIds = safeToStringArray(userDocument.guardianIds || []);
    user.dependents = safeToStringArray(userDocument.dependents || []);
    user.giftingProfile = userDocument.giftingProfile;
    user.followers = safeToStringArray(userDocument.followers || []);
    user.following = safeToStringArray(userDocument.following || []);
    return user;
  }
}
