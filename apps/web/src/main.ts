import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter, withEnabledBlockingInitialNavigation,
  withPreloading
} from '@angular/router';
import { CoreBrowserModule } from '@platon/core/browser';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    importProvidersFrom(
      CoreBrowserModule
    ),
    provideRouter(appRoutes,
      withEnabledBlockingInitialNavigation(),
      withPreloading(PreloadAllModules),
    ),
  ],
}).catch((err) => console.error(err));
