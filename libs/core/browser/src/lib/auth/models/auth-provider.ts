import { AuthToken, ResetPasswordInput, User } from '@platon/core/common'

export abstract class AuthProvider {
  abstract token(): Promise<AuthToken | undefined>

  /**
   * Gets the current logged user.
   * @returns A promise that will resolves with the user found or `undefined` once the server will response.
   */
  abstract current(): Promise<User | undefined>

  /**
   * Signs in an user using email and password.
   * @param username the username of the user.
   * @param password the password of the user.
   * @returns A promise that resolves with an authentification token.
   */
  abstract signIn(username: string, password: string): Promise<User>

  abstract signInWithToken(token: AuthToken): Promise<User>

  abstract resetPassword(input: ResetPasswordInput): Promise<User>

  /**
   * Sign out the current user
   */
  abstract signOut(): Promise<void>
}
