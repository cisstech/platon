import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LTIService } from './lti.service';
import { LTIProvider, OutcomeService } from './provider';

@Injectable()
export class LTIMiddleware implements NestMiddleware {
  constructor(
    private readonly lti: LTIService
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.body?.oauth_consumer_key) {
      return next();
    }

    const consumerKey = req.body.oauth_consumer_key;
    const lms = (await this.lti.findLMS(consumerKey)).get();
    if (!lms) {
      return next();
    }

    const provider = new LTIProvider(lms.consumerKey, lms.consumerSecret);
    await provider.validate(req);

    return res.redirect(302, '/')
  }
}
