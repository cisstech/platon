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
import { RESOURCE_PROVIDERS } from '@platon/feature/resource/browser';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    importProvidersFrom(
      CoreBrowserModule,

      MatDialogModule,
      MatSnackBarModule,
    ),
    provideRouter(appRoutes,
      withEnabledBlockingInitialNavigation(),
      withPreloading(PreloadAllModules),
    ),
    RESOURCE_PROVIDERS
  ],
}).catch((err) => console.error(err));
