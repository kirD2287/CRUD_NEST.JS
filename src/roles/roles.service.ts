import { Injectable } from '@nestjs/common'
import { CreateRoleDto } from './dto/role.dto'
import { PrismaService } from '../prisma.service'

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) {}

    async createRole(dto: CreateRoleDto) {
        const role = await this.prisma.roles.create({ data: dto })
        return role
    }

    async getRoleByValue(value: string) {
        const role = await this.prisma.roles.findFirst({ where: { value } })
        return role
    }
}
