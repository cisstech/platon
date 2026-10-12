import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { User, UnauthorizedResponse } from '@platon/core/common'
import { createUserEntity } from '@platon/core/testing/server'
import { TokenExpiredError } from 'jsonwebtoken'
import { of } from 'rxjs'
import { AuthGuard } from './auth.guard'

const buildHttpContext = (request: Record<string, unknown>): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext)

describe('AuthGuard', () => {
  let reflector: jest.Mocked<Reflector>
  let guard: AuthGuard
  let superCanActivate: jest.SpyInstance

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>
    guard = new AuthGuard(reflector)
    superCanActivate = jest.spyOn(Object.getPrototypeOf(AuthGuard.prototype), 'canActivate')
  })

  afterEach(() => jest.restoreAllMocks())

  describe('canActivate', () => {
    it("devrait autoriser une route publique même si l'authentification échoue", async () => {
      reflector.getAllAndOverride.mockReturnValue(true)
      superCanActivate.mockImplementation(() => {
        throw new Error('no token')
      })
      const context = buildHttpContext({})

      await expect(guard.canActivate(context)).resolves.toBe(true)
    })

    it("devrait rejeter une route privée si l'authentification échoue", async () => {
      reflector.getAllAndOverride.mockReturnValue(false)
      const error = new Error('no token')
      superCanActivate.mockImplementation(() => {
        throw error
      })
      const context = buildHttpContext({})

      await expect(guard.canActivate(context)).rejects.toThrow(error)
    })

    it('devrait retourner true si super.canActivate retourne true (synchrone)', async () => {
      reflector.getAllAndOverride.mockReturnValue(false)
      superCanActivate.mockReturnValue(true)
      const context = buildHttpContext({})

      await expect(guard.canActivate(context)).resolves.toBe(true)
    })

    it('devrait retourner false si super.canActivate retourne false (synchrone) et route non publique', async () => {
      reflector.getAllAndOverride.mockReturnValue(false)
      superCanActivate.mockReturnValue(false)
      const context = buildHttpContext({})

      await expect(guard.canActivate(context)).resolves.toBe(false)
    })

    it('devrait attendre une Promise retournée par super.canActivate', async () => {
      reflector.getAllAndOverride.mockReturnValue(false)
      superCanActivate.mockReturnValue(Promise.resolve(true))
      const context = buildHttpContext({})

      await expect(guard.canActivate(context)).resolves.toBe(true)
    })

    it('devrait forcer true sur une route publique même si la Promise résout à false', async () => {
      reflector.getAllAndOverride.mockReturnValue(true)
      superCanActivate.mockReturnValue(Promise.resolve(false))
      const context = buildHttpContext({})

      await expect(guard.canActivate(context)).resolves.toBe(true)
    })

    it('devrait attendre un Observable retourné par super.canActivate', async () => {
      reflector.getAllAndOverride.mockReturnValue(false)
      superCanActivate.mockReturnValue(of(true))
      const context = buildHttpContext({})

      await expect(guard.canActivate(context)).resolves.toBe(true)
    })

    it("devrait exposer request.memoize et ne calculer la valeur mémoïsée qu'une seule fois", async () => {
      reflector.getAllAndOverride.mockReturnValue(false)
      superCanActivate.mockReturnValue(true)
      const request: Record<string, unknown> = {}
      const context = buildHttpContext(request)

      await guard.canActivate(context)

      const compute = jest.fn().mockResolvedValue('computed-value')
      const memoize = request['memoize'] as (key: string, fn: () => Promise<unknown>) => Promise<unknown>
      const first = await memoize('key', compute)
      const second = await memoize('key', compute)

      expect(first).toBe('computed-value')
      expect(second).toBe('computed-value')
      expect(compute).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleRequest', () => {
    it('devrait lever UnauthorizedResponse si le token est expiré', () => {
      const context = buildHttpContext({})

      expect(() =>
        guard.handleRequest(null, null as unknown as User, new TokenExpiredError('expired', new Date()), context, null)
      ).toThrow(UnauthorizedResponse)
    })

    it('devrait lever UnauthorizedResponse si info est un tableau contenant un TokenExpiredError', () => {
      const context = buildHttpContext({})
      const info = [new TokenExpiredError('expired', new Date())]

      expect(() => guard.handleRequest(null, null as unknown as User, info, context, null)).toThrow(
        UnauthorizedResponse
      )
    })

    it('devrait déléguer au comportement par défaut de Passport dans les autres cas', () => {
      const context = buildHttpContext({})
      const user = createUserEntity({ id: 'user-1' })

      const result = guard.handleRequest(null, user, null, context, null)

      expect(result).toBe(user)
    })
  })
})
