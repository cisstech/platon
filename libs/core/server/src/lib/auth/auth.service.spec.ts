import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestResponse, ForbiddenResponse, UserRoles } from '@platon/core/common'
import { createUserEntity } from '@platon/core/testing/server'
import * as bcrypt from 'bcrypt'
import { Optional } from 'typescript-optional'
import { AuthService } from './auth.service'
import { IRequest } from './auth.types'
import { UserService } from '../users/user.service'

jest.mock('bcrypt')

describe('AuthService', () => {
  let service: AuthService
  let userService: jest.Mocked<UserService>
  let jwtService: jest.Mocked<JwtService>

  const config: Record<string, unknown> = {
    secret: 'test-secret',
    'auth.accessLifetime': '1h',
    'auth.refreshLifetime': '7d',
    'auth.salt': 10,
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('signed-token') },
        },
        {
          provide: UserService,
          useValue: {
            findByIdOrName: jest.fn(),
            findByUsername: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            touchLastLogin: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => config[key]) },
        },
      ],
    }).compile()

    service = module.get(AuthService)
    userService = module.get(UserService)
    jwtService = module.get(JwtService)
  })

  describe('signIn', () => {
    it('devrait répondre à un utilisateur inconnu comme à un mauvais mot de passe, sans dire lequel', async () => {
      userService.findByIdOrName.mockResolvedValue(Optional.empty())
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('decoy-hash')
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.signIn({ username: 'unknown', password: 'pwd' })).rejects.toEqual(
        new BadRequestResponse('Username or password is incorrect')
      )
      // Compared against a decoy: an unknown account takes as long to refuse as a wrong password.
      expect(bcrypt.compare).toHaveBeenCalledWith('pwd', 'decoy-hash')
    })

    it('devrait rejeter de la même façon un utilisateur sans mot de passe, dans le même temps', async () => {
      userService.findByIdOrName.mockResolvedValue(Optional.of(createUserEntity({ password: undefined })))
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('decoy-hash')
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      await expect(service.signIn({ username: 'testuser', password: 'pwd' })).rejects.toEqual(
        new BadRequestResponse('Username or password is incorrect')
      )
      expect(bcrypt.compare).toHaveBeenCalledWith('pwd', 'decoy-hash')
    })

    it('devrait rejeter de la même façon un mot de passe incorrect', async () => {
      userService.findByIdOrName.mockResolvedValue(Optional.of(createUserEntity({ password: 'hashed' })))
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.signIn({ username: 'testuser', password: 'wrong' })).rejects.toEqual(
        new BadRequestResponse('Username or password is incorrect')
      )
    })

    it('devrait retourner un token si les identifiants sont corrects', async () => {
      const user = createUserEntity({ id: 'user-1', username: 'testuser', password: 'hashed' })
      userService.findByIdOrName.mockResolvedValue(Optional.of(user))
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.signIn({ username: 'testuser', password: 'good' })

      expect(result).toEqual({ accessToken: 'signed-token', refreshToken: 'signed-token' })
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-1', username: 'testuser' },
        { secret: 'test-secret', expiresIn: '1h' }
      )
    })
  })

  describe('signUp', () => {
    it("devrait rejeter avec BadRequestResponse si l'utilisateur existe déjà", async () => {
      userService.findByIdOrName.mockResolvedValue(Optional.of(createUserEntity()))

      await expect(
        service.signUp({
          email: 'a@a.com',
          username: 'testuser',
          password: 'pwd',
          lastName: 'Doe',
          firstName: 'John',
          role: UserRoles.student,
        })
      ).rejects.toBeInstanceOf(BadRequestResponse)
      expect(userService.create).not.toHaveBeenCalled()
    })

    it('devrait créer un utilisateur avec un mot de passe hashé et retourner un token', async () => {
      userService.findByIdOrName.mockResolvedValue(Optional.empty())
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pwd')
      userService.create.mockResolvedValue(createUserEntity({ id: 'new-user', username: 'newuser' }))

      const result = await service.signUp({
        email: 'a@a.com',
        username: 'newuser',
        password: 'plain-pwd',
        lastName: 'Doe',
        firstName: 'John',
        role: UserRoles.student,
      })

      expect(bcrypt.hash).toHaveBeenCalledWith('plain-pwd', 10)
      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'newuser', password: 'hashed-pwd' })
      )
      expect(result).toEqual({ accessToken: 'signed-token', refreshToken: 'signed-token' })
    })
  })

  describe('signInDemo', () => {
    it('devrait créer un utilisateur anonyme avec le rôle demo et retourner userId + authToken', async () => {
      userService.create.mockResolvedValue(createUserEntity({ id: 'demo-1', role: UserRoles.demo }))

      const result = await service.signInDemo()

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRoles.demo, active: true, username: expect.stringMatching(/^demo\./) })
      )
      expect(result.userId).toBe('demo-1')
      expect(result.authToken).toEqual({ accessToken: 'signed-token', refreshToken: 'signed-token' })
    })
  })

  describe('resetPassword', () => {
    const buildReq = (reqUser: ReturnType<typeof createUserEntity>) => ({ user: reqUser } as unknown as IRequest)

    it("devrait rejeter avec ForbiddenResponse si un non-admin tente de changer le mot de passe d'un autre utilisateur", async () => {
      const target = createUserEntity({ username: 'target', password: 'hashed' })
      userService.findByUsername.mockResolvedValue(Optional.of(target))
      const req = buildReq(createUserEntity({ username: 'someone-else', role: UserRoles.student }))

      await expect(
        service.resetPassword({ username: 'target', password: 'old', newPassword: 'Abcdefghijk1!' }, req)
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it("devrait autoriser un admin à changer le mot de passe de quelqu'un d'autre", async () => {
      const target = createUserEntity({ id: 'target-id', username: 'target', password: 'hashed' })
      userService.findByUsername.mockResolvedValue(Optional.of(target))
      userService.update.mockResolvedValue(target)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed')
      const req = buildReq(createUserEntity({ username: 'admin', role: UserRoles.admin }))

      const result = await service.resetPassword(
        { username: 'target', password: 'old', newPassword: 'Abcdefghijk1!' },
        req
      )

      expect(userService.update).toHaveBeenCalledWith('target', expect.objectContaining({ password: 'new-hashed' }))
      expect(result).toEqual({ accessToken: 'signed-token', refreshToken: 'signed-token' })
    })

    it("devrait rejeter avec ForbiddenResponse si l'ancien mot de passe est incorrect", async () => {
      const target = createUserEntity({ username: 'testuser', password: 'hashed' })
      userService.findByUsername.mockResolvedValue(Optional.of(target))
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
      const req = buildReq(createUserEntity({ username: 'testuser', role: UserRoles.student }))

      await expect(
        service.resetPassword({ username: 'testuser', password: 'wrong-old', newPassword: 'Abcdefghijk1!' }, req)
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it("devrait rejeter avec BadRequestResponse si le nouveau mot de passe est identique à l'ancien", async () => {
      const target = createUserEntity({ username: 'testuser', password: 'hashed' })
      userService.findByUsername.mockResolvedValue(Optional.of(target))
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      const req = buildReq(createUserEntity({ username: 'testuser', role: UserRoles.student }))

      await expect(
        service.resetPassword({ username: 'testuser', password: 'same-pwd', newPassword: 'same-pwd' }, req)
      ).rejects.toBeInstanceOf(BadRequestResponse)
    })

    it('devrait rejeter avec BadRequestResponse si le nouveau mot de passe ne respecte pas le format requis', async () => {
      const target = createUserEntity({ username: 'testuser', password: 'hashed' })
      userService.findByUsername.mockResolvedValue(Optional.of(target))
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      const req = buildReq(createUserEntity({ username: 'testuser', role: UserRoles.student }))

      await expect(
        service.resetPassword({ username: 'testuser', password: 'old-pwd', newPassword: 'too-short' }, req)
      ).rejects.toBeInstanceOf(BadRequestResponse)
    })

    it('devrait autoriser un utilisateur sans mot de passe existant à en définir un nouveau', async () => {
      const target = createUserEntity({ id: 'target-id', username: 'testuser', password: undefined })
      userService.findByUsername.mockResolvedValue(Optional.of(target))
      userService.update.mockResolvedValue(target)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed')
      const req = buildReq(createUserEntity({ username: 'testuser', role: UserRoles.student }))

      const result = await service.resetPassword({ username: 'testuser', newPassword: 'Abcdefghijk1!' }, req)

      expect(bcrypt.compare).not.toHaveBeenCalled()
      expect(result).toEqual({ accessToken: 'signed-token', refreshToken: 'signed-token' })
    })
  })

  describe('authenticate', () => {
    it('devrait générer un access token et un refresh token avec les bonnes durées de vie', async () => {
      await service.authenticate('user-1', 'testuser')

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-1', username: 'testuser' },
        { secret: 'test-secret', expiresIn: '1h' }
      )
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-1', username: 'testuser' },
        { secret: 'test-secret', expiresIn: '7d' }
      )
    })

    it('devrait mettre à jour la dernière connexion sans bloquer la réponse', async () => {
      const result = await service.authenticate('user-1', 'testuser')

      expect(userService.touchLastLogin).toHaveBeenCalledWith('user-1')
      expect(result).toEqual({ accessToken: 'signed-token', refreshToken: 'signed-token' })
    })

    it('ne devrait pas faire échouer authenticate si touchLastLogin rejette', async () => {
      userService.touchLastLogin.mockRejectedValue(new Error('db error'))

      await expect(service.authenticate('user-1', 'testuser')).resolves.toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      })
    })
  })

  describe('createCandidateAccount', () => {
    it('devrait créer un compte candidat et retourner son id', async () => {
      userService.create.mockResolvedValue(createUserEntity({ id: 'candidate-1', role: UserRoles.candidate }))

      const id = await service.createCandidateAccount({ firstName: 'John', lastName: 'Doe', email: 'a@a.com' })

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'a@a.com',
          role: UserRoles.candidate,
          active: true,
          username: expect.stringMatching(/^candidat\./),
        })
      )
      expect(id).toBe('candidate-1')
    })
  })
})
