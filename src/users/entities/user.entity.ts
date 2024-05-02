import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

/**
 * Represents a User entity.
 */
@Entity()
export class UserEntity {
  /**
   * The primary key of the user.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The email address of the user.
   */
  @Index()
  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
  })
  email: string;

  /**
   * The password of the user.
   */
  @Column({
    type: 'varchar',
    nullable: false,
  })
  password: string;

  /**
   * The date and time when the user was created.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * The date and time when the user was last updated.
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * The date and time when the user was deleted.
   */
  @DeleteDateColumn()
  deletedAt?: Date;
}
