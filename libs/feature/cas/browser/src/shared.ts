// What both interfaces share from this library: no component, no UI vendor (ng-zorro, Material).
// The new interface imports from here; the main entry pulls in all of it.
// Same files as the main entry, so a class here is the same injection token there.
export * from './lib/api/cas.service'
export * from './lib/providers'
