import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { PrismaService } from 'src/prisma.serviсe'
import { RolesService } from 'src/roles/roles.service'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private rolesService: RolesService
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
        const role = await this.rolesService.getRoleByValue('ADMIN')
        await this.prisma.UsersRoles.create({
            data: {
                userId: user.id,
                roleId: role.id,
            },
        })

        return user
    }

    async getAllUsers() {
        const users = await this.prisma.users.findMany({
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        })
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
