import { Routes } from '@angular/router'
import { legacyBridgeGuard } from './core/legacy-bridge/legacy-bridge-guard'
import { AnnouncementsStore } from './pages/announcements/data/announcements-store'
import { CoursesStore } from './pages/courses/data/courses-store'
import { SHELL_ROLES, sessionGuard } from './core/session/session-guard'
import { Home } from './pages/home/home'
import { StudentHomeStore } from './pages/home/data/student-home-store'
import { TeacherHomeStore } from './pages/home/data/teacher-home-store'
import { Login } from './pages/login/login'
import { loginGuard } from './pages/login/login-guard'
import { LoginStore } from './pages/login/data/login-store'
import { NotificationsStore } from './shell/notifications/data/notifications-store'
import { Shell } from './shell/shell'
import { ShellStore } from './shell/data/shell-store'

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
      { path: 'dashboard', component: Home, title: 'Accueil', providers: [StudentHomeStore, TeacherHomeStore] },
      // Loaded on demand: the content of an announcement brings its parser.
      {
        path: 'announcements',
        loadComponent: () => import('./pages/announcements/announcements').then((page) => page.Announcements),
        title: 'Annonces',
        providers: [AnnouncementsStore],
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/courses/courses').then((page) => page.Courses),
        title: 'Cours',
        // The page has its own « Créer un cours »: Create turns quiet in the cover.
        data: { quietCreate: true },
        providers: [CoursesStore],
      },
      // The address of the creation of a course: the list, with its dialog open.
      { path: 'courses/create', redirectTo: '/courses?create=true' },
    ],
  },
  { path: '**', canActivate: [legacyBridgeGuard], children: [] },
]
