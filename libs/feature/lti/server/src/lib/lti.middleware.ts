import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { signInUrl } from '@platon/core/common'
import { AuthService } from '@platon/core/server'
import { NextFunction, Request, Response } from 'express'
import { LTIService } from './lti.service'
import { LTIProvider } from './provider'

@Injectable()
export class LTIMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LTIMiddleware.name)

  constructor(private readonly lti: LTIService, private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.body?.oauth_consumer_key) {
      return next()
    }

    const consumerKey = req.body.oauth_consumer_key
    this.logger.log(`[LTI MIDDLEWARE] Consumer key reçu: ${consumerKey}`)

    const optional = await this.lti.findLmsByConsumerKey(consumerKey)
    if (optional.isEmpty()) {
      this.logger.warn(`[LTI MIDDLEWARE] LMS non trouvé pour le consumer key: ${consumerKey}`)
      res.redirect(302, '/')
      return
    }

    const lms = optional.get()
    this.logger.log(`[LTI MIDDLEWARE] LMS trouvé: ${lms.name} (ID: ${lms.id})`)

    if (!lms) {
      this.logger.warn(`[LTI MIDDLEWARE] LMS trouvé mais invalide`)
      return next()
    }

    try {
      const provider = new LTIProvider(lms.consumerKey, lms.consumerSecret)
      this.logger.log(`[LTI MIDDLEWARE] Validation du provider LTI`)

      await provider.validate(req)
      this.logger.log(`[LTI MIDDLEWARE] Validation LTI réussie`)

      this.logger.log(`[LTI MIDDLEWARE] Récupération/création de l'utilisateur LMS`)
      const lmsUser = await this.lti.withLmsUser(lms, provider.body)
      this.logger.log(`[LTI MIDDLEWARE] Utilisateur LMS récupéré: ${lmsUser.user.username} (ID: ${lmsUser.user.id})`)

      this.logger.log(`[LTI MIDDLEWARE] Authentification de l'utilisateur`)
      const token = await this.authService.authenticate(lmsUser.user.id, lmsUser.user.username)
      this.logger.log(`[LTI MIDDLEWARE] Tokens générés avec succès`)

      const nextUrl = req.query['next']?.toString() || '/'
      this.logger.log(`[LTI MIDDLEWARE] URL de redirection: ${nextUrl}`)

      const args = {
        lms,
        lmsUser,
        payload: provider.body,
        nextUrl,
      }

      this.logger.log(`[LTI MIDDLEWARE] Exécution des intercepteurs LTI`)
      await this.lti.interceptLaunch(args)
      this.logger.log(`[LTI MIDDLEWARE] Intercepteurs LTI exécutés, URL finale: ${args.nextUrl}`)

      // The address carries the tokens: only where it leads is logged.
      this.logger.log(`[LTI MIDDLEWARE] Redirection vers la connexion, puis ${args.nextUrl}`)

      return res.redirect(302, signInUrl(token, args.nextUrl))
    } catch (error) {
      this.logger.error(`[LTI MIDDLEWARE] Erreur lors du traitement LTI:`, error)
      res.redirect(302, '/')
      return
    }
  }
}
