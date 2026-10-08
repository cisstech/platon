// What both interfaces share from this library: no component, no UI vendor (ng-zorro, Material,
// Monaco, ECharts). The new interface imports from here; the main entry pulls in all of it.
// Same files as the main entry, so a class here is the same injection token there.
export * from './lib/auth/api/auth.service'
export * from './lib/auth/api/token.service'
export * from './lib/auth/api/user.service'
export * from './lib/auth/providers'
export * from './lib/dialog/dialog.service'
export * from './lib/graphql/graphql.module'
export * from './lib/http/http-param-encoder.interceptor'
export * from './lib/services/storage.service'
