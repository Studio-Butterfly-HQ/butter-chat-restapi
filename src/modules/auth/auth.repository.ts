import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { CompanyUser, role } from '../company-user/entities/company-user.entity';
import { LoginAuthDto } from './dto/login.dto';
import { RegisterCompanyDto } from './dto/registration.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
    
    private dataSource: DataSource,
  ) {}

  async register(registerDto: RegisterCompanyDto) {
    // Check if subdomain already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { subdomain: registerDto.subdomain }
    });
    if (existingCompany) {
      throw new ConflictException('Subdomain already taken');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Use transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Company
      const company = queryRunner.manager.create(Company, {
        company_name: registerDto.company_name,
        subdomain: registerDto.subdomain,
      });
      const savedCompany = await queryRunner.manager.save(Company, company);

      // 2. Hash password and create User
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
      
      const user = queryRunner.manager.create(User, {
        user_name: registerDto.company_name+"_Admin",
        email: registerDto.email,
        password: hashedPassword,
      });
      const savedUser = await queryRunner.manager.save(User, user);

      // 3. Link user to company as OWNER
      const companyUser = queryRunner.manager.create(CompanyUser, {
        company_id: savedCompany.id,
        user_id: savedUser.id,
        role: role.OWNER,
      });
      await queryRunner.manager.save(CompanyUser, companyUser);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return sanitized data (without password)
      return {
        company: {
          id: savedCompany.id,
          company_name: savedCompany.company_name,
          subdomain: savedCompany.subdomain,
          status: savedCompany.status,
        },
        user: {
          id: savedUser.id,
          email: savedUser.email,
          user_name:savedUser.user_name
        },
        role: role.OWNER
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginAuthDto) {
    // Find user by email with company relations
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    // Check if user exists
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return user info with all companies they belong to
    return {
      user: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
      }
    };
  }


  //export them later....
  // Helper method: Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['companyUsers', 'companyUsers.company']
    });
  }

  // Helper method: Find user by ID
  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['companyUsers', 'companyUsers.company']
    });
  }

  // Helper method: Update refresh token
  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { refresh_token: refreshToken }
    );
  }

  // Helper method: Validate user credentials (for JWT strategy)
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // Helper method: Get user companies
  async getUserCompanies(userId: string) {
    const companyUsers = await this.companyUserRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['company', 'department']
    });

    return companyUsers.map(cu => ({
      company_id: cu.company.id,
      company_name: cu.company.company_name,
      subdomain: cu.company.subdomain,
      logo: cu.company.logo,
      role: cu.role,
      status: cu.status,
      department_id: cu.department_id,
      department_name: cu.department?.department_name || null,
    }));
  }
}