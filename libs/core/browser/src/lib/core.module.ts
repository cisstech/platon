import { NgModule } from '@angular/core';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthProviders } from './auth';
import { GraphQLModule } from './graphql/graphql.module';
import { HttpParamEncoderInterceptor } from './http/http-param-encoder.interceptor';
import { NgZorroProviders } from './vendors/ng-zorro/ng-zorro.';
import { NgeDocProviders } from './vendors/nge-doc/nge-doc';
import { NgeMarkdownProviders } from './vendors/nge-markdown/nge-markdown';
import { NgeMonacoImports, NgeMonacoProviders } from './vendors/nge-monaco/nge-monaco';
import { RouterModule } from '@angular/router';
import { NgeIconProviders } from './vendors/nge-icon/nge-icon';


@NgModule({
  imports: [
    RouterModule,
    NgeMonacoImports,
    GraphQLModule,
  ],
  exports: [
    NgeMonacoImports,
    GraphQLModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpParamEncoderInterceptor, multi: true },
    AuthProviders,
    NgeDocProviders,
    NgZorroProviders,
    NgeIconProviders,
    NgeMonacoProviders,
    NgeMarkdownProviders
  ]
})
export class CoreBrowserModule { }
