/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import url from 'url';
import { Signer } from './signer';
import { encodeRFC3986 } from '../utils';

function encodeBody(body: any, query: any) {
  const out: string[] = [];
  const encodeParam = (key: string, val: any) => `${key}=${encodeRFC3986(val)}`;
  const cleanParams = (params: any) => {
    if (typeof params !== 'object') {
      return;
    }
    for (const key in params) {
      if (key === 'oauth_signature') {
        continue;
      }
      const vals = params[key];
      if (Array.isArray(vals)) {
        for (const val of vals) {
          out.push(encodeParam(key, val));
        }
      } else {
        out.push(encodeParam(key, vals));
      }
    }
  };
  cleanParams(body);
  cleanParams(query);
  return encodeRFC3986(out.sort().join('&'));
}

export class HmacSha1 implements Signer {
  public readonly method = 'HMAC-SHA1';

  public buildSignature(
    req: any,
    secret: string,
    token?: string
  ): string {
    const hapiRawReq = req.raw && req.raw.req;
    const body = req.body;
    if (hapiRawReq) {
      req = hapiRawReq;
    }
    let originalUrl = req.originalUrl || req.url;
    let protocol = req.headers['x-forwarded-proto'] || req.protocol
    if (body.tool_consumer_info_product_family_code === 'canvas') {
      originalUrl = url.parse(originalUrl).pathname;
    }

    if (!protocol) {
      const encrypted = req.connection.encrypted;
      protocol = encrypted && 'https' || 'http';
    }

    const parsedUrl = url.parse(originalUrl, true);
    const hitUrl = `${protocol}://${req.headers.host}${parsedUrl.pathname}`;
    return this.buildSignatureRaw(hitUrl, parsedUrl, req.method, body, secret, token);
  }

  public buildSignatureRaw(
    reqUrl: string,
    parsedUrl: url.UrlWithParsedQuery,
    method: string,
    params: any,
    consumerSecret: string,
    token?: string
  ): string {
    const sig = [method.toUpperCase(), encodeRFC3986(reqUrl), encodeBody(params, parsedUrl.query)];
    return this.sign(sig.join('&'), consumerSecret, token);
  }

  private sign(str: string, key: string, token?: string) {
    key += '&';
    if (token) {
      key += token;
    }
    return crypto.createHmac('sha1', key).update(str).digest('base64');
  }
}
