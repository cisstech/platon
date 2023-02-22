import { Injectable } from '@angular/core';
import { ResourceLayout } from '@platon/feature/player/common';
import { Observable } from 'rxjs';
import { PlayerProvider } from '../models/player-provider';

@Injectable({ providedIn: 'root' })
export class PlayerService {

  constructor(
    private readonly provider: PlayerProvider
  ) { }

  preview(resourceId: string, resourceVersion: string): Observable<ResourceLayout> {
    return this.provider.preview(resourceId, resourceVersion);
  }
}
