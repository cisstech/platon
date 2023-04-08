import { ListResponse } from "@platon/core/common";
import { CircleTree, CreateResource, Resource, ResourceCompletion, ResourceFilters, ResourceStatisic, UpdateResource } from "@platon/feature/resource/common";
import { Observable } from "rxjs";


export abstract class ResourceProvider {
  abstract tree(): Observable<CircleTree>;
  abstract circle(username: string): Observable<Resource>;
  abstract statistic(resource: Resource): Observable<ResourceStatisic>;
  abstract completion(): Observable<ResourceCompletion>;

  abstract search(filters?: ResourceFilters): Observable<ListResponse<Resource>>;
  abstract find(id: string, markAsViewed?: boolean): Observable<Resource>;
  abstract update(id: string, input: UpdateResource): Observable<Resource>;
  abstract create(input: CreateResource): Observable<Resource>;
}
