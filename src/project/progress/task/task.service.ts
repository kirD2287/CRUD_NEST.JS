import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma.serviсe'
import { CreateTaskDto } from './dto/task.dto'

@Injectable()
export class TaskService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    async getTasks(req: any, projectId: number, progressId: number) {
        const userId = await this.tokenUserId(req)
        const tasks = await this.prismaService.task.findMany({
            where: {
                userId: userId,
                progressId: progressId,
                progress: {
                    projectId: projectId,
                },
            },
            include: {
                progress: true,
            },
        })
        return tasks
    }

    async createTask(
        req: any,
        projectId: number,
        progressId: number,
        dto: CreateTaskDto
    ) {
        const userId = await this.tokenUserId(req)
        const task = await this.prismaService.task.create({
            data: {
                name: dto.name,
                text: dto.text,
                progressId: progressId,
                userId: userId,
            },
        })
        return task
    }

    async deleteTask(
        req: any,
        projectId: number,
        progressId: number,
        taskId: number
    ) {
        const userId = await this.tokenUserId(req)
        const task = await this.prismaService.task.delete({
            where: {
                id: taskId,
                userId: userId,
                progressId: progressId,
            },
        })
        return task
    }

    private async tokenUserId(req) {
        const token = await req.headers.authorization.split(' ')[1]
        const user = await this.jwtService.verify(token)
        return user.id
    }
}
