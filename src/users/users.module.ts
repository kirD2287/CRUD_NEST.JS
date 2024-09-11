import { forwardRef, Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { PrismaClient } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { RolesService } from 'src/roles/roles.service'
import { AuthModule } from 'src/auth/auth.module'
import { CacheModule } from '@nestjs/cache-manager'
import * as redisStore from 'cache-manager-redis-store'



@Module({
    controllers: [UsersController],
    providers: [UsersService, PrismaClient, PrismaService, RolesService],
    exports: [UsersService],
    imports: [forwardRef(() => AuthModule), 
        CacheModule.register({
        store: redisStore,
        host: 'localhost',
        port: 6379,
        ttl: 3600,
        max: 5000
        }),
    ],
})
export class UsersModule {}
