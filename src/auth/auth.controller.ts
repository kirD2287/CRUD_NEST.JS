import { Body, Controller, Logger, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { AuthService } from './auth.service'

@ApiTags('Авторизация и регистрация')
@Controller('/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Авторизация пользователя' })
    @ApiResponse({ status: 200, type: CreateUserDto })
    @Post('/login')
    login(@Body() userDto: CreateUserDto) {
        return this.authService.login(userDto)
    }

    @ApiOperation({ summary: 'Регистрация пользователя' })
    @ApiResponse({ status: 200, type: CreateUserDto })
    @Post('/registration')
    registration(@Body() userDto: CreateUserDto) {
        return this.authService.registration(userDto)
    }
}
