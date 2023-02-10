/* eslint-disable @typescript-eslint/no-explicit-any */

import { InjectionToken, Type } from '@angular/core';
import { User } from '@platon/core/common';

export interface AuthChange {
  user: User;
  type: 'connection' | 'disconnection';
}

export interface AuthObserver {
  onChangeAuth(change: AuthChange): void | Promise<void>;
}

export const AUTH_OBSERVER = new InjectionToken<Type<any>>('AUTH_OBSERVER');
