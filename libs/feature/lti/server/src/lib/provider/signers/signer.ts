/* eslint-disable @typescript-eslint/no-explicit-any */
import url from 'url';

export interface Signer {
  readonly method: string;

  buildSignature(req: any, secret: string, token?: string): string;
  buildSignatureRaw(
    reqUrl: string,
    parsedUrl: url.UrlWithParsedQuery,
    method: string,
    params: any,
    consumerSecret: string,
    token?: string
  ): string;
}
