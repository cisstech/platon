import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Configuration } from '../config/configuration';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService<Configuration>) => ({
        secret: config.get('secret', { infer: true })
      }),
      inject: [ConfigService]
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
  controllers: [
    AuthController
  ],
  exports: [
    JwtModule
  ],
})
export class AuthModule { };
