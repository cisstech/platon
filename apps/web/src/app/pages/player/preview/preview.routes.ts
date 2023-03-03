import { Routes } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import { UserRoles } from '@platon/core/common';
import { ResourcePreviewPage } from './preview.page';

export default [
  withAuthGuard(
    {
      path: ':id',
      component: ResourcePreviewPage
    }, [UserRoles.teacher, UserRoles.admin]
  ),
] as Routes;
