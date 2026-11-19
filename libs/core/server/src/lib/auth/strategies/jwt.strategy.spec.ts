import { ConfigService } from '@nestjs/config'
import { UnauthorizedResponse } from '@platon/core/common'
import { createUserEntity } from '@platon/core/testing/server'
import { Optional } from 'typescript-optional'
import { JwtStrategy } from './jwt.strategy'
import { UserService } from '../../users/user.service'
import { Configuration } from '../../config/configuration'

describe('JwtStrategy', () => {
  let strategy: JwtStrategy
  let userService: jest.Mocked<UserService>

  beforeEach(() => {
    userService = {
      findByIdOrName: jest.fn(),
      updateLastActivity: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserService>
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService<Configuration>
    strategy = new JwtStrategy(userService, configService)
  })

  it("devrait retourner l'utilisateur et mettre à jour sa dernière activité si le token est valide", async () => {
    const user = createUserEntity({ id: 'user-1', username: 'testuser' })
    userService.findByIdOrName.mockResolvedValue(Optional.of(user))

    const result = await strategy.validate({ sub: 'user-1', username: 'testuser', typ: 'access' })

    expect(userService.findByIdOrName).toHaveBeenCalledWith('user-1')
    expect(userService.updateLastActivity).toHaveBeenCalledWith(user)
    expect(result).toBe(user)
  })

  it("devrait rejeter le jeton d'un utilisateur qui n'existe plus", async () => {
    userService.findByIdOrName.mockResolvedValue(Optional.empty())

    await expect(strategy.validate({ sub: 'unknown', username: 'ghost', typ: 'access' })).rejects.toEqual(
      new UnauthorizedResponse('The user of the token no longer exists')
    )
    expect(userService.updateLastActivity).not.toHaveBeenCalled()
  })

  it('devrait refuser un jeton de rafraîchissement', async () => {
    await expect(strategy.validate({ sub: 'user-1', username: 'testuser', typ: 'refresh' })).rejects.toEqual(
      new UnauthorizedResponse('An access token is expected')
    )
    expect(userService.findByIdOrName).not.toHaveBeenCalled()
  })

  it("devrait lire un jeton sans type comme un jeton d'accès, jusqu'à son expiration", async () => {
    const user = createUserEntity({ id: 'user-1', username: 'testuser' })
    userService.findByIdOrName.mockResolvedValue(Optional.of(user))

    await expect(strategy.validate({ sub: 'user-1', username: 'testuser' })).resolves.toBe(user)
  })
})
