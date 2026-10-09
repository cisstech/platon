import { Routes } from '@angular/router'
import { legacyBridgeGuard } from './core/legacy-bridge/legacy-bridge-guard'
import { SHELL_ROLES, sessionGuard } from './core/session/session-guard'
import { Home } from './pages/home/home'
import { Login } from './pages/login/login'
import { loginGuard } from './pages/login/login-guard'
import { LoginStore } from './pages/login/login-store'
import { NotificationsStore } from './shell/notifications/notifications-store'
import { Shell } from './shell/shell'
import { ShellStore } from './shell/shell-store'

/**
 * The ported screens: the sign-in page, then the screens of the shell, behind the session. Every
 * other address opens in the current interface: the bridge is never guarded.
 */
export const nextRoutes: Routes = [
  // Outside the frame and without a session: it is where the session starts.
  {
    path: 'login',
    component: Login,
    title: 'Connexion à PLaTon',
    providers: [LoginStore],
    canActivate: [loginGuard],
  },
  {
    path: '',
    component: Shell,
    providers: [ShellStore, NotificationsStore],
    canActivate: [sessionGuard(SHELL_ROLES)],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Home, title: 'PLaTon' },
    ],
  },
  { path: '**', canActivate: [legacyBridgeGuard], children: [] },
]
