import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter, withEnabledBlockingInitialNavigation,
  withPreloading
} from '@angular/router';
import { CoreBrowserModule } from '@platon/core/browser';
import { ANSWER_PROVIDERS } from '@platon/feature/answer/browser';
import { COURSE_PROVIDERS } from '@platon/feature/course/browser';
import { LTI_PROVIDERS } from '@platon/feature/lti/browser';
import { PLAYER_PROVIDERS } from '@platon/feature/player/browser';
import { RESOURCE_PROVIDERS } from '@platon/feature/resource/browser';
import { FeatureWebComponentModule } from '@platon/feature/webcomponent';
import { AppPage } from './app/app.page';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppPage, {
  providers: [
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    importProvidersFrom(
      CoreBrowserModule,
      FeatureWebComponentModule,

      MatDialogModule,
      MatSnackBarModule,
    ),
    provideRouter(appRoutes,
      withEnabledBlockingInitialNavigation(),
      withPreloading(PreloadAllModules),
    ),
    COURSE_PROVIDERS,
    RESOURCE_PROVIDERS,
    PLAYER_PROVIDERS,
    ANSWER_PROVIDERS,
    LTI_PROVIDERS,
  ],
}).catch((err) => console.error(err));
