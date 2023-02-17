import { Provider } from "@angular/core";
import { FileProvider } from "./models/file-provider";
import { ResourceProvider } from "./models/resource-provider";
import { RemoteFileProvider } from "./providers/remote-file.provider";
import { RemoteResourceProvider } from "./providers/remote-resource.provider";

export const RESOURCE_PROVIDERS: Provider[] = [
  { provide: ResourceProvider, useClass: RemoteResourceProvider },
  { provide: FileProvider, useClass: RemoteFileProvider },
];
