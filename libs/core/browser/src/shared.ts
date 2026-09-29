// What both interfaces share from this library: no component, no UI vendor (ng-zorro, Material,
// Monaco, ECharts). The new interface imports from here; the main entry pulls in all of it.
// Same files as the main entry, so a class here is the same injection token there.
export * from './lib/dialog/dialog.service'
export * from './lib/services/storage.service'
