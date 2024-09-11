import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma.service'
import { SwapProgressesDto } from './dto/progresses.dto'
import { CreateProjectDto } from '../dto/project.dto'

@Injectable()
export class ProgressService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    async getProgresses(req: any, projectId: number) {
        const userId = await this.tokenUserId(req)
        const progresses = await this.prismaService.progress.findMany({
            where: {
                projectId: projectId,
                userId: userId,
            },
        })
        return progresses
    }

    async createProgress(req: any, projectId: number, dto: CreateProjectDto) {
        const userId = await this.tokenUserId(req)
        const progress = await this.prismaService.progress.create({
            data: {
                name: dto.name,
                userId: userId,
                projectId: projectId,
            },
        })
        return progress
    }

    async swapId(req: any, dto: SwapProgressesDto) {
        const userId = await this.tokenUserId(req)
        const progress1 = await this.prismaService.progress.findUnique({
            where: {
                id: dto.progress1,
                userId: userId,
            },
        })
        const progress2 = await this.prismaService.progress.findUnique({
            where: {
                id: dto.progress2,
                userId: userId,
            },
        })

        if (!progress1 || !progress2) {
            throw new HttpException(
                'One or both progress entries not found',
                HttpStatus.NOT_FOUND
            )
        }

        const tempName = progress1.name
        progress1.name = progress2.name
        progress2.name = tempName

        await this.prismaService.$transaction([
            this.prismaService.progress.update({
                where: { id: dto.progress1 },
                data: { name: progress1.name },
            }),
            this.prismaService.progress.update({
                where: { id: dto.progress2 },
                data: { name: progress2.name },
            }),
        ])

        return { success: true }
    }

    async deleteProgress(req: any, projectId: number, progressId: number) {
        const userId = await this.tokenUserId(req)
        await this.prismaService.task.deleteMany({
            where: {
                progressId: progressId,
                userId: userId,
            },
        })
        const progress = await this.prismaService.progress.delete({
            where: {
                id: progressId,
                projectId: projectId,
                userId: userId,
            },
        })
        return progress
    }

    private async tokenUserId(req) {
        const token = await req.headers.authorization.split(' ')[1]
        const user = await this.jwtService.verify(token)
        return user.id
    }
}
