import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthProvider } from './models/auth-provider';
import { UserProvider } from './models/user-provider';
import { RemoteAuthProvider } from './providers/remote-auth.provider';
import { RemoteUserProvider } from './providers/remote-user.provider';

export const AuthProviders: Provider[] = [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: AuthProvider, useClass: RemoteAuthProvider },
    { provide: UserProvider, useClass: RemoteUserProvider },
];
