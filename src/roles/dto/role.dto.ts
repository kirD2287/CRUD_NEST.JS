import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateRoleDto {
    @ApiProperty({
        example: 'Admin',
        description: 'Уникальное значение роли пользователя',
    })
    @IsString({ message: 'Должно быть строкой' })
    @IsNotEmpty()
    readonly value: string
    @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
    @IsString({ message: 'Должно быть строкой' })
    @IsNotEmpty()
    readonly description: string
}
