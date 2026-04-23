import UserRepository from '../../../Domains/users/UserRepository.js';
import AuthenticationRepository from '../../../Domains/authentications/AuthenticationRepository.js';
import AuthenticationTokenManager from '../../security/AuthenticationTokenManager.js';
import PasswordHash from '../../security/PasswordHash.js';
import LoginUserUseCase from '../LoginUserUseCase.js';
import NewAuth from '../../../Domains/authentications/entities/NewAuth.js';
import { vi } from 'vitest';

describe('LoginUserUseCase', () => {
  it('should orchestrating the login user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      username: 'dicoding',
      password: 'secret',
    };
    const mockedAuthentication = new NewAuth({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    const mockPasswordHash = new PasswordHash();

    // Mocking
    mockUserRepository.getPasswordByUsername = vi.fn()
      .mockImplementation(() => Promise.resolve('encrypted_password'));
    mockPasswordHash.comparePassword = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.createAccessToken = vi.fn()
      .mockImplementation(() => Promise.resolve(mockedAuthentication.accessToken));
    mockAuthenticationTokenManager.createRefreshToken = vi.fn()
      .mockImplementation(() => Promise.resolve(mockedAuthentication.refreshToken));
    mockUserRepository.getIdByUsername = vi.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockAuthenticationRepository.addToken = vi.fn()
      .mockImplementation(() => Promise.resolve());

    // create use case instance
    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash,
    });

    // Action
    const actualAuthentication = await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(actualAuthentication).toEqual(new NewAuth({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    }));
    expect(mockUserRepository.getPasswordByUsername)
      .toBeCalledWith('dicoding');
    expect(mockPasswordHash.comparePassword)
      .toBeCalledWith('secret', 'encrypted_password');
    expect(mockUserRepository.getIdByUsername)
      .toBeCalledWith('dicoding');
    expect(mockAuthenticationTokenManager.createAccessToken)
      .toBeCalledWith({ username: 'dicoding', id: 'user-123' });
    expect(mockAuthenticationTokenManager.createRefreshToken)
      .toBeCalledWith({ username: 'dicoding', id: 'user-123' });
    expect(mockAuthenticationRepository.addToken)
      .toBeCalledWith(mockedAuthentication.refreshToken);
  });

  it('should propagate error when password comparison fails', async () => {
    const useCasePayload = {
      username: 'dicoding',
      password: 'secret',
    };
    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    const mockPasswordHash = new PasswordHash();

    mockUserRepository.getPasswordByUsername = vi.fn()
      .mockImplementation(() => Promise.resolve('encrypted_password'));
    mockPasswordHash.comparePassword = vi.fn()
      .mockImplementation(() => Promise.reject(new Error('AUTHENTICATION.INVALID_CREDENTIALS')));
    mockUserRepository.getIdByUsername = vi.fn();
    mockAuthenticationTokenManager.createAccessToken = vi.fn();
    mockAuthenticationTokenManager.createRefreshToken = vi.fn();
    mockAuthenticationRepository.addToken = vi.fn();

    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash,
    });

    await expect(loginUserUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('AUTHENTICATION.INVALID_CREDENTIALS');
    expect(mockUserRepository.getIdByUsername).not.toBeCalled();
    expect(mockAuthenticationTokenManager.createAccessToken).not.toBeCalled();
    expect(mockAuthenticationTokenManager.createRefreshToken).not.toBeCalled();
    expect(mockAuthenticationRepository.addToken).not.toBeCalled();
  });
});
