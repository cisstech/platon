export interface NonceStore {
  ensuresNotExpired(nonce: string, timestamp: number): void | Promise<void>;
}
