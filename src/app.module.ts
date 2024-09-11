import { Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { UsersModule } from './users/users.module'
import { RolesModule } from './roles/roles.module'
import { AuthModule } from './auth/auth.module'
import { ProjectModule } from './project/project.module'
import { ProgressService } from './project/progress/progress.service'
import { ProgressController } from './project/progress/progress.controller'
import { TaskController } from './project/progress/task/task.controller'
import { TaskService } from './project/progress/task/task.service'



@Module({
    controllers: [ProgressController, TaskController],
    providers: [PrismaService, ProgressService, TaskService],
    imports: [
        UsersModule, 
        RolesModule, 
        AuthModule, 
        ProjectModule
    ],
    exports: [PrismaService],
})
export class AppModule {}
