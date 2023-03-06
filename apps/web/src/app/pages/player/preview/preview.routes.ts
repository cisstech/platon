import { Routes } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import { UserRoles } from '@platon/core/common';
import { PlayerPreviewPage } from './preview.page';

export default [
  withAuthGuard(
    {
      path: ':id',
      component: PlayerPreviewPage
    }, [UserRoles.teacher, UserRoles.admin]
  ),
] as Routes;
