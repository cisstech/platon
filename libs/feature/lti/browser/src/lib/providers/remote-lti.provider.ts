import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CreatedResponse, ItemResponse, ListResponse } from "@platon/core/common";
import { CreateLms, Lms, LmsFilters, UpdateLms } from "@platon/feature/lti/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LTIProvider } from "../models/lms-provider";

@Injectable()
export class RemoteLTIProvider extends LTIProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  searchLms(filters?: LmsFilters): Observable<ListResponse<Lms>> {
    filters = filters || {};
    let params = new HttpParams();

    if (filters.search) {
      params = params.append('search', filters.search);
    }

    if (filters.order) {
      params = params.append('order', filters.order);
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction);
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString());
    }

    return this.http.get<ListResponse<Lms>>(`/api/v1/lti/lms`, { params });
  }

  findLms(id: string): Observable<Lms> {
    return this.http.get<ItemResponse<Lms>>(`/api/v1/lti/lms/${id}`).pipe(
      map(response => response.resource),
    );
  }

  updateLms(id: string, input: UpdateLms): Observable<Lms> {
    return this.http.patch<ItemResponse<Lms>>(`/api/v1/lti/lms/${id}`, input).pipe(
      map(response => response.resource)
    );
  }

  createLms(input: CreateLms): Observable<Lms> {
    return this.http.post<CreatedResponse<Lms>>('/api/v1/lti/lms', input).pipe(
      map(response => response.resource)
    );
  }
}
