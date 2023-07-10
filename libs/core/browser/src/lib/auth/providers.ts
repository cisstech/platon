import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { Provider } from '@angular/core'
import { AuthInterceptor } from './interceptors/auth.interceptor'
import { AuthProvider } from './models/auth-provider'
import { TokenProvider } from './models/token-provider'
import { UserGroupProvider } from './models/user-group-provider'
import { UserPrefsProvider } from './models/user-prefs-provider'
import { UserProvider } from './models/user-provider'
import { RemoteAuthProvider } from './providers/remote-auth.provider'
import { RemoteTokenProvider } from './providers/remote-token.provider'
import { RemoteUserGroupProvider } from './providers/remote-user-group.provider'
import { RemoteUserPrefsProvider } from './providers/remote-user-prefs.provider'
import { RemoteUserProvider } from './providers/remote-user.provider'

export const AuthProviders: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: AuthProvider, useClass: RemoteAuthProvider },
  { provide: UserProvider, useClass: RemoteUserProvider },
  { provide: UserGroupProvider, useClass: RemoteUserGroupProvider },
  { provide: UserPrefsProvider, useClass: RemoteUserPrefsProvider },
  { provide: TokenProvider, useClass: RemoteTokenProvider },
]
