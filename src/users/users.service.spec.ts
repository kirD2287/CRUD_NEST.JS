import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RolesService } from 'src/roles/roles.service';
import { PrismaService } from 'src/prisma.service';

describe('UsersService', () => {
    let service: UsersService;
    let cacheManager: Cache;

    const mockPrismaService = {
        users: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        UsersRoles: {
            create: jest.fn(),
        },
    };

    const mockRolesService = {
        getRoleByValue: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: RolesService, useValue: mockRolesService },
                {
                    provide: CACHE_MANAGER,
                    useValue: {
                        get: jest.fn(),
                        set: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        cacheManager = module.get<Cache>(CACHE_MANAGER);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const dto = { email: 'test@example.com', password: 'password' };
            const existingUser = null;
            const newUser = { id: 1, email: dto.email, password: dto.password };
            const role = { id: 1 };

            mockPrismaService.users.findUnique.mockResolvedValue(existingUser);
            mockPrismaService.users.create.mockResolvedValue(newUser);
            mockRolesService.getRoleByValue.mockResolvedValue(role);
            mockPrismaService.UsersRoles.create.mockResolvedValue({});

            const result = await service.createUser(dto);
            expect(result).toEqual(newUser);
            expect(mockPrismaService.users.create).toHaveBeenCalledWith({
                data: {
                    email: dto.email,
                    password: dto.password,
                },
            });
            expect(mockPrismaService.UsersRoles.create).toHaveBeenCalledWith({
                data: {
                    userId: newUser.id,
                    roleId: role.id,
                },
            });
        });

        it('should throw an error if user already exists', async () => {
            const dto = { email: 'test@example.com', password: 'password' };
            const existingUser = { id: 1, email: dto.email, password: dto.password };

            mockPrismaService.users.findUnique.mockResolvedValue(existingUser);

            await expect(service.createUser(dto)).rejects.toThrow('Пользователь с таким email уже существует');
        });
    });

    describe('getAllUsers', () => {
        it('should return cached users if available', async () => {
            const cacheKey = 'users';
            const cachedUsers = [{ id: 1, email: 'test@example.com' }];

            cacheManager.get = jest.fn().mockResolvedValue(cachedUsers);

            const result = await service.getAllUsers();
            expect(result).toEqual(cachedUsers);
            expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
        });

        it('should return users from the database if not cached', async () => {
            const cacheKey = 'users';
            const users = [{ id: 1, email: 'test@example.com' }];

            cacheManager.get = jest.fn().mockResolvedValue(null);
            mockPrismaService.users.findMany.mockResolvedValue(users);
            cacheManager.set = jest.fn();

            const result = await service.getAllUsers();
            expect(result).toEqual(users);
            expect(mockPrismaService.users.findMany).toHaveBeenCalled();
            expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, users);
        });
    });

    describe('getUserByEmail', () => {
        it('should return user by email', async () => {
            const email = 'test@example.com';
            const user = { id: 1, email };

            mockPrismaService.users.findFirst.mockResolvedValue(user);

            const result = await service.getUserByEmail(email);
            expect(result).toEqual(user);
            expect(mockPrismaService.users.findFirst).toHaveBeenCalledWith({
                where: { email },
                include: {
                    roles: {
                        include: { role: true },
                    },
                },
            });
        });

        it('should return null if user not found', async () => {
            const email = 'test@example.com';

            mockPrismaService.users.findFirst.mockResolvedValue(null);

            const result = await service.getUserByEmail(email);
            expect(result).toBeNull();
        });
    });

    describe('updateUser', () => {
        it('should update and return user', async () => {
            const id = 1;
            const updatedUser = { email: 'updated@example.com', password: 'newpassword' };
            const user = { id, ...updatedUser };

            mockPrismaService.users.update.mockResolvedValue(user);

            const result = await service.updateUser(id, updatedUser);
            expect(result).toEqual(user);
            expect(mockPrismaService.users.update).toHaveBeenCalledWith({
                where: { id },
                data: updatedUser,
            });
        });

        it('should throw an error if user not found', async () => {
            const id = 1;
            const updatedUser = { email: 'updated@example.com', password: 'newpassword' };

            mockPrismaService.users.update.mockResolvedValue(null);

            await expect(service.updateUser(id, updatedUser)).rejects.toThrow(`User with ID ${id} not found`);
        });
    });

    describe('deleteUser', () => {
        it('should delete and return user', async () => {
            const id = 1;
            const user = { id };

            mockPrismaService.users.delete.mockResolvedValue(user);

            const result = await service.deleteUser(id);
            expect(result).toEqual(user);
            expect(mockPrismaService.users.delete).toHaveBeenCalledWith({ where: { id } });
        });

        it('should throw an error if user not found', async () => {
            const id = 1;

            mockPrismaService.users.delete.mockResolvedValue(null);

            await expect(service.deleteUser(id)).rejects.toThrow(`User with ID ${id} not found`);
        });
    });

    describe('getUserRoles', () => {
        it('should return user roles', async () => {
            const userId = 1;
            const userWithRoles = {
                roles: [
                    {
                        role: {
                            id: 1,
                            value: 'Admin',
                            description: 'Administrator',
                        },
                    },
                ],
            };

            mockPrismaService.users.findFirst.mockResolvedValue(userWithRoles);

            const result = await service.getUserRoles(userId);
            expect(result).toEqual([
                {
                    id: 1,
                    value: 'Admin',
                    description: 'Administrator',
                },
            ]);
            expect(mockPrismaService.users.findFirst).toHaveBeenCalledWith({
                where: { id: userId },
                include: {
                    roles: {
                        select: {
                            role: {
                                select: {
                                    id: true,
                                    value: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
            });
        });

        it('should throw an error if user not found', async () => {
            const userId = 1;

            mockPrismaService.users.findFirst.mockResolvedValue(null);

            await expect(service.getUserRoles(userId)).rejects.toThrow('Пользователь не найден');
        });
    });
});
