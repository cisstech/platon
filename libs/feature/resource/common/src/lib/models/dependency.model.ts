export interface ResourceDependency {
  resourceId: string
  resourceName: string
  resourceVersion: string
  dependOnId: string
  dependOnName: string
  dependOnVersion: string
}

export interface CreateResourceDependency {
  resourceId: string
  dependOnId: string
  resourceVersion: string
  dependOnVersion: string
}
