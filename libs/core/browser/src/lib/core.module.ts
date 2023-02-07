import { NgModule } from '@angular/core';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpParamEncoderInterceptor } from './http/http-param-encoder.interceptor';
import { NgZorroProviders } from './vendors/ng-zorro/ng-zorro.';
import { NgeDocProviders } from './vendors/nge-doc/nge-doc';
import { NgeMarkdownProviders } from './vendors/nge-markdown/nge-markdown';
import { NgeMonacoImports } from './vendors/nge-monaco/nge-monaco';


@NgModule({
  imports: [
    NgeMonacoImports,
  ],
  exports: [
    NgeMonacoImports,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpParamEncoderInterceptor, multi: true },

    NgeDocProviders,
    NgZorroProviders,
    NgeMarkdownProviders
  ]
})
export class CoreBrowserModule { }
