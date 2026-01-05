import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { CompanyUser } from '../company-user/entities/company-user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, CompanyUser]),
    JwtModule.register({
      secret:'secret_for_jwt_abcxyz_123',
      signOptions:{expiresIn:'15m'}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
})
export class AuthModule {}
