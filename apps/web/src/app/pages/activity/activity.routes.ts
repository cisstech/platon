import { Routes } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import { UserRoles } from '@platon/core/common';

export default [
  withAuthGuard({
    path: 'create',
    loadChildren: () => import(
      /* webpackChunkName: "activity-create" */
      './create/create.routes'
    )
  }, [UserRoles.admin, UserRoles.teacher]),
] as Routes;
