import { Routes } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import { PlayerActivityPage } from './activity.page';

export default [
  withAuthGuard(
    {
      path: ':id',
      component: PlayerActivityPage
    }
  ),
] as Routes;
