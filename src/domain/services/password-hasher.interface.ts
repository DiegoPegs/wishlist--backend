export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, _hashedPassword: string): Promise<boolean>;
}
