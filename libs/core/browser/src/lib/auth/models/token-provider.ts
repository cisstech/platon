import { AuthToken } from '@platon/core/common';

export abstract class TokenProvider {
  abstract tokenSync(): AuthToken | undefined;

  /**
   * Gets the current auth token if it exists.
   * @returns A promise that resolves with an auth token or `undefined`.
   */
  abstract token(): Promise<AuthToken | undefined>;

  /** Deletes the current auth token */
  abstract remove(): Promise<void>

  /**
   * Generates new auth token for the identified by `username`.
   *
   * Once the token is generared, it will be stored to the browser localStorage.
   * You must call `remove()` method to delete it.
   *
   * @param username An user name.
   * @param password An user password.
   * @returns A promise that resolves with an auth token.
   */
  abstract obtain(username: string, password: string): Promise<AuthToken>;

  /**
   * Refreshs the current auth token.
   * @returns A promise that resolves with an auth token.
   */
  abstract refresh(): Promise<AuthToken>;

  abstract save(token: AuthToken): Promise<void>;

}
