import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma.serviсe'
import { CreateProjectDto } from './dto/project.dto'

@Injectable()
export class ProjectService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    async getProjects(req) {
        const userId = await this.tokenUserId(req)
        const projects = await this.prismaService.project.findMany({
            where: {
                userId: userId,
            },
        })
        return projects
    }

    async getProject(req, projectId: number) {
        const userId = await this.tokenUserId(req)
        const project = await this.prismaService.project.findMany({
            where: {
                id: projectId,
                userId: userId,
            },
        })
        return project
    }

    async createProject(req, dto: CreateProjectDto) {
        const userId = await this.tokenUserId(req)
        const project = await this.prismaService.project.create({
            data: {
                name: dto.name,
                userId: userId,
            },
        })
        return project
    }

    async deleteProject(req, projectId: number) {
        const userId = await this.tokenUserId(req)
        await this.prismaService.task.deleteMany({
            where: {
                progress: {
                    projectId: projectId,
                    userId: userId,
                },
            },
        })
        await this.prismaService.progress.deleteMany({
            where: {
                projectId: projectId,
                userId: userId,
            },
        })
        const project = await this.prismaService.project.delete({
            where: {
                id: projectId,
                userId: userId,
            },
        })
        return project
    }

    private async tokenUserId(req) {
        const token = await req.headers.authorization.split(' ')[1]
        const user = await this.jwtService.verify(token)
        return user.id
    }
}
