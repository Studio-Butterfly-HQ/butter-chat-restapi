import { Inject, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DepartmentModule } from './modules/department/department.module';
import { CompanyModule } from './modules/company/company.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/entities/user.entity';
import { Company } from './modules/company/entities/company.entity';
import { Department } from './modules/department/entities/department.entity';
import { CompanyUserModule } from './modules/company-user/company-user.module';
import { CompanyUser } from './modules/company-user/entities/company-user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal:true,
     }),
     TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory:(configService: ConfigService)=>({
         type:'mysql',
         host:configService.get('DB_HOST'),
         port:+configService.get('DB_PORT'),
         username:configService.get('DB_USERNAME'),
         password:configService.get('DB_PASSWORD'),
         database:configService.get('DB_DATABASE'),
         entities:[Company,User,CompanyUser,Department],
         synchronize:true,
         logging:true
      }),
      inject:[ConfigService]
     }),
     AuthModule, UserModule, DepartmentModule, CompanyModule, CompanyUserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
