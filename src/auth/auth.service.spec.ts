import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.model';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  const mockUsersService = {
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    getUserRoles: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return a token if user is validated', async () => {
      const userDto: CreateUserDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser as any);
      jest.spyOn(service, 'generateToken').mockResolvedValue({ token: 'jwtToken' });

      const result = await service.login(userDto);
      expect(result).toEqual({ token: 'jwtToken' });
    });

    it('should throw UnauthorizedException if user is not validated', async () => {
      const userDto: CreateUserDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(service, 'validateUser').mockRejectedValue(new UnauthorizedException());

      await expect(service.login(userDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('registration', () => {
    it('should throw HttpException if user already exists', async () => {
      const userDto: CreateUserDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(mockUsersService, 'getUserByEmail').mockResolvedValue(mockUser);

      await expect(service.registration(userDto)).rejects.toThrow(
        new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST)
      );
    });

    it('should create a user and return a token', async () => {
      const userDto: CreateUserDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(mockUsersService, 'getUserByEmail').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation((password: string, salt: string) => Promise.resolve('hashedPassword'));
      jest.spyOn(mockUsersService, 'createUser').mockResolvedValue(mockUser);
      jest.spyOn(service, 'generateToken').mockResolvedValue({ token: 'jwtToken' });

      const result = await service.registration(userDto);
      expect(result).toEqual({ token: 'jwtToken' });
    });
  });

  describe('generateToken', () => {
    it('should generate a token with roles', async () => {
      jest.spyOn(mockUsersService, 'getUserRoles').mockResolvedValue(['user']);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

      const result = await service['generateToken'](mockUser as any);
      expect(result).toEqual({ token: 'jwtToken' });
    });
  });

  describe('validateUser', () => {
    it('should return a user if credentials are valid', async () => {
      const userDto: CreateUserDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(mockUsersService, 'getUserByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation((password: string, hashedPassword: string) => Promise.resolve(true));

      const result = await service['validateUser'](userDto as any);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const userDto: CreateUserDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(mockUsersService, 'getUserByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation((password: string, hashedPassword: string) => Promise.resolve(false));

      await expect(service['validateUser'](userDto as any)).rejects.toThrow(UnauthorizedException);
    });
  });
});
