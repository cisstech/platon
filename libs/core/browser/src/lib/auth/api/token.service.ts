import { Injectable } from '@angular/core';
import { AuthToken } from '@platon/core/common';
import { TokenProvider } from '../models/token-provider';

@Injectable({ providedIn: 'root' })
export class TokenService {
  constructor(
    private readonly provider: TokenProvider
  ) { }

  tokenSync(): AuthToken | undefined {
    return this.provider.tokenSync();
  }

  token(): Promise<AuthToken | undefined> {
    return this.provider.token();
  }

  remove(): Promise<void> {
    return this.provider.remove();
  }

  obtain(username: string, password: string): Promise<AuthToken> {
    return this.provider.obtain(username, password);
  }

  refresh(): Promise<AuthToken> {
    return this.provider.refresh();
  }
}
