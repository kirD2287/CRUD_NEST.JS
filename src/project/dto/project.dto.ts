import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateProjectDto {
    @ApiProperty({
        description: 'Название проекта',
        example: 'Project',
    })
    @IsString({ message: 'Название проекта должно быть строкой' })
    @IsNotEmpty()
    readonly name: string
}
