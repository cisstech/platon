import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '@platon/core/server';
import { NextFunction, Request, Response } from 'express';
import { LTIService } from './lti.service';
import { LTIProvider } from './provider';

@Injectable()
export class LTIMiddleware implements NestMiddleware {
  constructor(
    private readonly lti: LTIService,
    private readonly authService: AuthService,
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.body?.oauth_consumer_key) {
      return next();
    }

    const consumerKey = req.body.oauth_consumer_key;
    const optional = await this.lti.findLmsByConsumerKey(consumerKey)
    if (optional.isEmpty()) {
      res.redirect(302, '/');
      return
    }

    const lms = optional.get();
    if (!lms) {
      return next();
    }

    const provider = new LTIProvider(lms.consumerKey, lms.consumerSecret);
    await provider.validate(req);

    const lmsUser = await this.lti.withLmsUser(lms, provider.body);
    const token = await this.authService.authenticate(
      lmsUser.user.id,
      lmsUser.user.username,
    );

    const nextUrl = '/'; // TODO should be the url of a course if specified

    return res.redirect(
      302,
      `/login?lti-launch=true&access-token=${token.accessToken}&refresh-token=${token.refreshToken}&next=${nextUrl}`
    )
  }
}
