import { forwardRef, Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { PrismaClient } from '@prisma/client'
import { PrismaService } from 'src/prisma.serviсe'
import { RolesService } from 'src/roles/roles.service'
import { AuthModule } from 'src/auth/auth.module'

@Module({
    controllers: [UsersController],
    providers: [UsersService, PrismaClient, PrismaService, RolesService],
    exports: [UsersService],
    imports: [forwardRef(() => AuthModule)],
})
export class UsersModule {}
