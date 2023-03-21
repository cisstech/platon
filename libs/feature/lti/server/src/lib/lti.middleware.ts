import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserRoles } from '@platon/core/common';
import { UserService } from '@platon/core/server';
import { NextFunction, Request, Response } from 'express';
import { LTIService } from './lti.service';
import { LTIProvider } from './provider';

@Injectable()
export class LTIMiddleware implements NestMiddleware {
  constructor(
    private readonly lti: LTIService,
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.body?.oauth_consumer_key) {
      return next();
    }

    const consumerKey = req.body.oauth_consumer_key;
    const lms = (await this.lti.findLmsByConsumerKey(consumerKey)).get();
    if (!lms) {
      return next();
    }

    const provider = new LTIProvider(lms.consumerKey, lms.consumerSecret);
    await this.lti.createLmsUser(lms, provider.body);
    await provider.validate(req);

    return res.redirect(302, '/')
  }
}
