import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlayerInput, ResourceLayout } from '@platon/feature/player/common';
import { Observable } from 'rxjs';
import { PlayerProvider } from '../models/player-provider';

@Injectable()
export class RemotePlayerService extends PlayerProvider {
  constructor(
    private readonly http: HttpClient
  ) {
    super();
  }

  preview(resourceId: string, resourceVersion: string): Observable<ResourceLayout> {
    return this.http.post<ResourceLayout>('/api/v1/player/play', {
      resourceId,
      resourceVersion: resourceVersion || 'latest'
    } as PlayerInput);
  }
}
