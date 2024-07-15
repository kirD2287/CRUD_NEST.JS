import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { RolesService } from './roles.service'
import { CreateRoleDto } from './dto/role.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Создание и просмотр ролей')
@Controller('/roles')
export class RolesController {
    constructor(private rolesService: RolesService) {}

    @ApiOperation({ summary: 'Создание роли' })
    @ApiResponse({ status: 200, type: CreateRoleDto })
    @Post()
    createRole(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.createRole(createRoleDto)
    }

    @ApiOperation({ summary: 'Получение роли по value' })
    @ApiResponse({ status: 200, type: CreateRoleDto })
    @Get('/:value')
    getRoleByValue(@Param('value') value: string) {
        return this.rolesService.getRoleByValue(value)
    }
}
