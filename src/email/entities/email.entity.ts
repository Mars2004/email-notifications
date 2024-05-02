import { UserEntity } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Email entity.
 */
@Entity()
export class EmailEntity {
  /**
   * The unique identifier of the email.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The template key of the email.
   */
  @Column({
    type: 'varchar',
    nullable: false,
  })
  templateKey: string;

  /**
   * The subject of the email.
   */
  @Column({
    type: 'varchar',
    nullable: false,
  })
  subject: string;

  /**
   * The body of the email as JSON.
   */
  @Column({
    type: 'json',
    nullable: false,
  })
  body: Record<string, unknown>;

  /**
   * The email addresses of the recipient (array).
   */
  @Column({
    type: 'simple-array',
    nullable: false,
  })
  to: string[];

  /**
   * The email addresses of the BCC recipient (array).
   */
  @Column({
    type: 'simple-array',
    nullable: true,
  })
  bcc: string[];

  /**
   * The UTC date and time when the email should be sent.
   */
  @Column({
    type: 'timestamp',
    nullable: false,
  })
  sendAt: Date;

  /**
   * The user associated with the email.
   */
  @Index()
  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  /**
   * The date and time when the postponed email was created.
   */
  @CreateDateColumn()
  createdAt: Date;
}
