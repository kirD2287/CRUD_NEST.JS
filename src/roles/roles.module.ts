import { Module } from '@nestjs/common'
import { RolesService } from './roles.service'
import { RolesController } from './roles.controller'
import { PrismaClient } from '@prisma/client'
import { PrismaService } from 'src/prisma.serviсe'
import { UsersModule } from 'src/users/users.module'
import { AuthService } from 'src/auth/auth.service'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'

@Module({
    providers: [RolesService, PrismaClient, PrismaService, AuthService],
    controllers: [RolesController],
    imports: [UsersModule, AuthModule],
    exports: [],
})
export class RolesModule {}
