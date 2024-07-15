import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class SwapProgressesDto {
    @ApiProperty({
        description: 'ID первого прогресса',
        example: '1',
    })
    @IsNumber({}, { message: 'ID прогресса должно быть числом' })
    @IsNotEmpty()
    readonly progress1: number

    @ApiProperty({
        description: 'ID второго прогрееса',
        example: '2',
    })
    @IsNumber({}, { message: 'ID прогресса должно быть числом' })
    @IsNotEmpty()
    readonly progress2: number
}
