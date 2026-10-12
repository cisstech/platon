import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { IRequest } from './auth.types'
import { createUserEntity } from '@platon/core/testing/server'

describe('AuthController', () => {
  let controller: AuthController
  let service: jest.Mocked<AuthService>

  const authToken = { accessToken: 'access-token', refreshToken: 'refresh-token' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
            resetPassword: jest.fn(),
            authenticate: jest.fn(),
            refresh: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(AuthController)
    service = module.get(AuthService)
  })

  describe('signUp', () => {
    it('devrait déléguer au service et retourner la ressource créée', async () => {
      service.signUp.mockResolvedValue(authToken)

      const result = await controller.signUp({
        email: 'a@a.com',
        username: 'newuser',
        password: 'pwd',
        lastName: 'Doe',
        firstName: 'John',
        role: 'student' as never,
      })

      expect(service.signUp).toHaveBeenCalledWith(expect.objectContaining({ username: 'newuser', email: 'a@a.com' }))
      expect(result.resource).toEqual(authToken)
    })
  })

  describe('signIn', () => {
    it('devrait déléguer au service et retourner le token', async () => {
      service.signIn.mockResolvedValue(authToken)

      const result = await controller.signIn({ username: 'testuser', password: 'pwd' })

      expect(service.signIn).toHaveBeenCalledWith({ username: 'testuser', password: 'pwd' })
      expect(result.resource).toEqual(authToken)
    })
  })

  describe('resetPassword', () => {
    it('devrait déléguer au service avec la requête courante', async () => {
      service.resetPassword.mockResolvedValue(authToken)
      const req = { user: createUserEntity() } as unknown as IRequest
      const input = { username: 'testuser', password: 'old', newPassword: 'Abcdefghijk1!' }

      const result = await controller.resetPassword(input, req)

      expect(service.resetPassword).toHaveBeenCalledWith(input, req)
      expect(result.resource).toEqual(authToken)
    })
  })

  describe('refresh', () => {
    it('devrait renouveler la session du jeton de rafraîchissement de la requête', async () => {
      service.refresh.mockResolvedValue(authToken)
      const user = createUserEntity({ id: 'user-1', username: 'testuser' })
      const req = { user, headers: { authorization: 'Bearer refresh-token' } } as unknown as IRequest

      const result = await controller.refresh(req)

      expect(service.refresh).toHaveBeenCalledWith(user, 'refresh-token')
      expect(result.resource).toEqual(authToken)
    })
  })
})
