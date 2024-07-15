import { ApiProperty } from '@nestjs/swagger'

export class Roles {
    @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
    id: number
    @ApiProperty({
        example: 'Admin',
        description: 'Уникальное значение роли пользователя',
    })
    value: string
    @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
    description: string
}
