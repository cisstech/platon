import { StoreError } from '../errors';
import { NonceStore } from './nonce-store';

const EXPIRE_IN_SEC = 5 * 60;

export class MemoryNonceStore implements NonceStore {
  private readonly used: Record<string, number> = {};

  ensuresNotExpired(nonce: string, timestamp: number): void {
    this.clearNonExpiredNounces();
    const firstTimeSeen = this.used[nonce] == null;
    if (!firstTimeSeen) {
      throw new StoreError('Nonce already seen');
    }

    this.used[nonce] = timestamp + EXPIRE_IN_SEC;

    let currentTime: number, timestampIsFresh: boolean;
    if (timestamp != null) {
      timestamp = parseInt(timestamp + '', 10);
      currentTime = Math.round(Date.now() / 1000);
      timestampIsFresh = (currentTime - timestamp) <= EXPIRE_IN_SEC;
      if (timestampIsFresh) {
        return;
      }
      throw new StoreError('Expired timestamp');
    }
    throw new StoreError('Timestamp required');
  }

  private clearNonExpiredNounces(): void {
    const now = Math.round(Date.now() / 1000);
    for (const nonce in this.used) {
      const expiry = this.used[nonce];
      if (expiry <= now) {
        delete this.used[nonce];
      }
    }
  }
}
