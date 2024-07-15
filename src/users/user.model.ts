import { ApiProperty } from '@nestjs/swagger'

export class User {
    @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
    id: number
    @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
    email: string
    @ApiProperty({ example: '123233', description: 'Пароль' })
    password: string
}
