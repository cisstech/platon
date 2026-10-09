// What both interfaces share from this library: no component, no UI vendor (ng-zorro, Material,
// Monaco). The new interface imports from here; the main entry pulls in all of it.
// Same files as the main entry, so a class here is the same injection token there.
export * from './lib/api/resource.service'
export * from './lib/pipes/resource-status.pipe'
export * from './lib/providers'
