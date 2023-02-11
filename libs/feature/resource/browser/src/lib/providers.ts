import { Provider } from "@angular/core";
import { ResourceProvider } from "./models/resource-provider";
import { RemoteResourceProvider } from "./services/remote-resource-provider";

export const RESOURCE_PROVIDERS: Provider[] = [
  { provide: ResourceProvider, useClass: RemoteResourceProvider },
];
