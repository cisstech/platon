import { ResourceLayout } from "@platon/feature/player/common";
import { Observable } from "rxjs";

export abstract class PlayerProvider {
  abstract preview(resourceId: string, resourceVersion: string): Observable<ResourceLayout>;
}
