import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { PrismaService } from 'src/prisma.service'
import { RolesService } from 'src/roles/roles.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'


@Injectable()
export class UsersService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private prisma: PrismaService,
        private rolesService: RolesService,
       
    ) {}
    async createUser(dto: CreateUserDto) {
        const existingUser = await this.prisma.users.findUnique({
            where: {
                email: dto.email,
            },
        })

        if (existingUser) {
            throw new Error('Пользователь с таким email уже существует')
        }
        const user = await this.prisma.users.create({
            data: {
                email: dto.email,
                password: dto.password,
            },
        })
        const role = await this.rolesService.getRoleByValue('Admin')
        await this.prisma.UsersRoles.create({
            data: {
                userId: user.id,
                roleId: role.id,
            },
        })

        return user
    }

    async getAllUsers() {
        const cacheKey = 'users'
        const cachedUsers = await this.cacheManager.get(cacheKey)
        if (cachedUsers) {
            return cachedUsers
        }
        const users = await this.prisma.users.findMany({
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        })
        await this.cacheManager.set(cacheKey, users)
        return users
    }
    async getUserByEmail(email: string) {
        const user = await this.prisma.users.findFirst({
            where: { email },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        })
        if (!user) {
            return null
        }
        return user
    }
    async updateUser(id: number, updatedUser: CreateUserDto) {
        const user = await this.prisma.users.update({
            where: { id },
            data: updatedUser,
        })
        if (!user) {
            throw new Error(`User with ID ${id} not found`)
        }
        return user
    }

    async deleteUser(id: number) {
        const user = await this.prisma.users.delete({ where: { id } })
        if (!user) {
            throw new Error(`User with ID ${id} not found`)
        }
        return user
    }

    async getUserRoles(
        userId: number
    ): Promise<{ id: number; value: string; description: string }[]> {
        const userWithRoles = await this.prisma.users.findFirst({
            where: { id: userId },
            include: {
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                value: true,
                                description: true,
                            },
                        },
                    },
                },
            },
        })

        if (!userWithRoles) {
            throw new HttpException(
                'Пользователь не найден',
                HttpStatus.NOT_FOUND
            )
        }

        return userWithRoles.roles.map((userRole) => ({
            id: userRole.role.id,
            value: userRole.role.value,
            description: userRole.role.description,
        }))
    }
}
