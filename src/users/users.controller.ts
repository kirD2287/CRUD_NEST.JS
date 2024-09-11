import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from './user.model'
import { Roles } from 'src/auth/roles-auth-decorator'
import { RolesGuard } from 'src/auth/roles.guard'
import { JWTAuthGuard } from 'src/auth/jwt-auth-guard'
import { Users } from '@prisma/client'



@ApiTags('CRUD Пользователей')
@Controller('/users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiOperation({ summary: 'Создание пользователя' })
    @ApiResponse({ status: 200, type: User })
    @Post()
    create(@Body() dto: CreateUserDto): Promise<Users> {
        return this.usersService.createUser(dto)
    }
    @ApiOperation({ summary: 'Получение списка пользователей' })
    @ApiResponse({ status: 200, type: [User] })
    @Roles('Admin')
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Get()
    getAll() {
        return this.usersService.getAllUsers()
    }

    @ApiOperation({ summary: 'Получение пользователя по email' })
    @ApiResponse({ status: 200, type: User })
    @Get(':email')
    getUserByEmail(@Param('email') email: string) {
        return this.usersService.getUserByEmail(email)
    }
    @ApiOperation({ summary: 'Обновление пользователя по id' })
    @ApiResponse({ status: 200, type: User })
    @Put(':id')
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatedUser: CreateUserDto
    ) {
        return this.usersService.updateUser(id, updatedUser)
    }
    @ApiOperation({ summary: 'Удаление пользователя по id' })
    @ApiResponse({ status: 200, type: User })
    @Delete(':id')
    deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.deleteUser(id)
    }
}
