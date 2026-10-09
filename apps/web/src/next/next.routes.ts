import { Routes } from '@angular/router'
import { legacyBridgeGuard } from './core/legacy-bridge/legacy-bridge-guard'
import { Home } from './pages/home/home'

/** The ported screens. Every other address opens in the current interface. */
export const nextRoutes: Routes = [
  { path: '', pathMatch: 'full', component: Home, title: 'PLaTon' },
  { path: '**', canActivate: [legacyBridgeGuard], children: [] },
]
