// What both interfaces share from this library: no component, no UI vendor (ng-zorro, Material).
// The new interface imports from here; the main entry pulls in the drawer and its list.
// Same files as the main entry, so a class here is the same injection token there.
export * from './lib/models/notification.graphql'
export * from './lib/models/notification.graphql.generated'
export * from './lib/models/notification.model'
