import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

/**
 * Repository for accessing and manipulating User entities.
 */
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Creates a new user with the provided email, and password.
   * @param email - The email address of the user.
   * @param password - The password of the user.
   * @returns A Promise that resolves to the created UserEntity.
   */
  async createUser(email: string, password: string): Promise<UserEntity> {
    const user = new UserEntity();
    user.email = email;
    user.password = password;

    return this.userRepository.save(user);
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user.
   * @returns A Promise that resolves to the UserEntity if found, or null if not found.
   */
  async getUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Retrieves a user by their email.
   * @param email - The email address of the user.
   * @returns A Promise that resolves to the UserEntity if found, or null if not found.
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
