import { ANIMATION_MODULE_TYPE, APP_INITIALIZER, LOCALE_ID } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { Apollo } from 'apollo-angular'
import { AuthService, DialogService, TokenService } from '@platon/core/browser/shared'
import { NZ_DATE_LOCALE, NZ_I18N } from 'ng-zorro-antd/i18n'
import { NzModalService } from 'ng-zorro-antd/modal'
import { ResourceService } from '@platon/feature/resource/browser/shared'
import { NextDialog } from './core/dialog/next-dialog'
import { nextConfig } from './next.config'

describe('nextConfig', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: nextConfig({ flag: 'off', stored: null, bridged: false }).providers })
  )

  it('speaks French, like the current interface', () => {
    expect(TestBed.inject(LOCALE_ID)).toBe('fr-FR')
  })

  it('shows messages and dialogs with the design system', () => {
    expect(TestBed.inject(DialogService)).toBeInstanceOf(NextDialog)
  })

  it('calls the API like the current interface: token, dates and parameters', () => {
    expect(TestBed.inject(AuthService)).toBeTruthy()
    expect(TestBed.inject(TokenService)).toBeTruthy()
    expect(TestBed.inject(HTTP_INTERCEPTORS).map((interceptor) => interceptor.constructor.name)).toEqual(
      expect.arrayContaining(['AuthInterceptor', 'DateConversionInterceptor', 'HttpParamEncoderInterceptor'])
    )
  })

  it('has a GraphQL client', () => {
    expect(TestBed.inject(Apollo)).toBeTruthy()
  })

  it('reaches the resources, for the invitations of the notifications', () => {
    expect(TestBed.inject(ResourceService)).toBeInstanceOf(ResourceService)
  })

  it('does not configure ng-zorro', () => {
    expect(TestBed.inject(NZ_I18N, null)).toBeNull()
    expect(TestBed.inject(NZ_DATE_LOCALE, null)).toBeNull()
  })

  it('does not provide the tutorials, which run on ng-zorro services', () => {
    expect(TestBed.inject(NzModalService, null)).toBeNull()
  })

  it('does not enable the animations module used by Material and ng-zorro', () => {
    expect(TestBed.inject(ANIMATION_MODULE_TYPE, null)).toBeNull()
  })

  it('does not run the initializer of the current interface', () => {
    expect(TestBed.inject(APP_INITIALIZER, [])).toEqual([])
  })
})
