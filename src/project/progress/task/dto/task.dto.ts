import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTaskDto {
    @ApiProperty({
        description: 'Имя задачи',
        example: 'Создать базу данных',
    })
    @IsString({ message: 'Название задачи должно быть строкой' })
    @IsNotEmpty()
    readonly name: string

    @ApiProperty({
        description: 'Описание',
        example: 'База данных в Postgres',
    })
    @IsString({ message: 'Описание должно быть строкой' })
    @IsNotEmpty()
    readonly text: string
}
