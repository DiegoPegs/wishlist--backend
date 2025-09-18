import type { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(_id: string): Promise<User | null>;
  findByIdIncludingInactive(_id: string): Promise<User | null>;
  findByEmail(_email: string): Promise<User | null>;
  findByUsername(_username: string): Promise<User | null>;
  findByEmailForAuth(_email: string): Promise<User | null>;
  findByUsernameForAuth(_username: string): Promise<User | null>;
  findByLoginWithPassword(login: string): Promise<User | null>;
  findByIds(_ids: string[]): Promise<User[]>;
  findDependentsIncludingInactive(_ids: string[]): Promise<User[]>;
  update(_id: string, data: Partial<User>): Promise<User | null>;
  delete(_id: string): Promise<boolean>;
  addFollower(_userIdToFollow: string, _currentUserId: string): Promise<void>;
  removeFollower(
    _userIdToUnfollow: string,
    _currentUserId: string,
  ): Promise<void>;
  addDependent(_guardianId: string, _dependentId: string): Promise<void>;
  addGuardian(_dependentId: string, _guardianId: string): Promise<void>;
  removeDependent(_guardianId: string, _dependentId: string): Promise<void>;
  removeGuardian(_dependentId: string, _guardianId: string): Promise<void>;
}
