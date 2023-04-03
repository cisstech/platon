import { Provider } from "@angular/core";
import { ResultProvider } from "./models/result-provider";
import { RemoteResultProvider } from "./providers/remote-result.provider";

export const RESULT_PROVIDERS: Provider[] = [
  { provide: ResultProvider, useClass: RemoteResultProvider },
];
