import { Injectable } from '@angular/core'
import { PeerProvider } from '../models/peer-provider'
import { PeerComparisonTreeOutput } from '@platon/feature/peer/common'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TreeService {
  constructor(private readonly peerProvider: PeerProvider) {}

  getTree(activityId: string): Observable<PeerComparisonTreeOutput> {
    return this.peerProvider.getTree(activityId)
  }
}
