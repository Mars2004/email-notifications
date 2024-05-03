import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { EmailEntity } from '../entities/email.entity';

/**
 * Repository for accessing and manipulating Email entities.
 */
@Injectable()
export class EmailRepository {
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
  ) {}

  /**
   * Creates a new email with delayed send.
   * @param delayedEmailDto - The data of the new delayed email.
   * @returns A Promise that resolves to the created EmailEntity.
   */
  async createDelayedEmail(
    delayedEmailDto: Partial<EmailEntity>,
  ): Promise<EmailEntity> {
    const delayedEmail = new EmailEntity();

    this.emailRepository.merge(delayedEmail, delayedEmailDto);
    return this.emailRepository.save(delayedEmail);
  }

  /**
   * Retrieves all delayed emails that are ready to be sent.
   * @param before - The UTC date before which the emails should be sent.
   * @returns A Promise that resolves to the EmailEntity if found, or null if not found.
   */
  async getEmailsToSendBefore(before: Date): Promise<EmailEntity[]> {
    return this.emailRepository.find({
      where: { sendAt: LessThan(before) },
      relations: ['user'],
    });
  }

  /**
   * Deletes a delayed email by its ID.
   * @param id - The ID of the delayed email.
   * @returns A Promise that resolves to void.
   */
  async deleteDelayedEmail(id: string): Promise<void> {
    await this.emailRepository.delete(id);
  }
}
