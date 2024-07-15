import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateUserDto {
    @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
    @IsString({ message: 'Должно быть строкой' })
    @IsEmail({}, { message: 'Некоректный email' })
    @IsNotEmpty()
    readonly email: string
    @ApiProperty({ example: '123233', description: 'Пароль' })
    @IsString({ message: 'Должно быть строкой' })
    @IsNotEmpty()
    @Length(4, 16, { message: 'Не меньше 4 и не больше 16' })
    readonly password: string
}
