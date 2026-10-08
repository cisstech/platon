import { Routes } from '@angular/router'
import { legacyBridgeGuard } from './core/legacy-bridge/legacy-bridge-guard'
import { SHELL_ROLES, sessionGuard } from './core/session/session-guard'
import { Home } from './pages/home/home'
import { Shell } from './shell/shell'
import { ShellStore } from './shell/shell-store'

/**
 * The ported screens, in the shell, behind the session. Every other address opens in the current
 * interface, the sign-in page included: the bridge is never guarded.
 */
export const nextRoutes: Routes = [
  {
    path: '',
    component: Shell,
    providers: [ShellStore],
    canActivate: [sessionGuard(SHELL_ROLES)],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Home, title: 'PLaTon' },
    ],
  },
  { path: '**', canActivate: [legacyBridgeGuard], children: [] },
]
