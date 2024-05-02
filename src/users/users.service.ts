import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UserEntity } from './entities/user.entity';

/**
 * Service responsible for handling user-related operations.
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Creates a new user.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns A Promise that resolves to the created user entity.
   */
  async createUser(email: string, password: string): Promise<UserEntity> {
    return this.usersRepository.createUser(email, password);
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user.
   * @returns A Promise that resolves to the user entity, or null if not found.
   */
  async getUserById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.getUserById(id);
  }

  /**
   * Retrieves a user by their email.
   * @param email - The email of the user.
   * @returns A Promise that resolves to the user entity, or null if not found.
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.getUserByEmail(email);
  }
}
