import { Entity, PrimaryGeneratedColumn, Column, Index, Unique, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Department } from 'src/modules/department/entities/department.entity';
import { Company } from 'src/modules/company/entities/company.entity';

@Entity('user_departments')
@Unique(['user_id', 'department_id'])
@Index(['company_id'])
@Index(['user_id', 'company_id'])
@Index(['department_id', 'company_id'])
export class UserDepartment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  department_id: string;

  @Column('uuid')
  company_id: string;

  @CreateDateColumn({ name: 'assigned_at' })
  assigned_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}