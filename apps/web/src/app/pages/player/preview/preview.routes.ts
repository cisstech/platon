import { Routes } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import { UserRoles } from '@platon/core/common';
import { ResourcePreviewComponent } from './preview.component';

export default [
  withAuthGuard(
    {
      path: ':id',
      component: ResourcePreviewComponent
    }, [UserRoles.teacher, UserRoles.admin]
  ),
] as Routes;
