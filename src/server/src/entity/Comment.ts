import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: (): number => 0 })
  index!: number;

  @Column('uuid')
  task_id!: string;

  @Column('uuid')
  commenter_id!: string;

  @Column('uuid')
  header_comment_id!: string | null;

  @Column()
  content!: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
