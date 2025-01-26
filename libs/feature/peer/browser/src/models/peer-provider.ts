import { Observable } from 'rxjs'
import { PeerComparisonTreeOutput } from '@platon/feature/peer/common'

export abstract class PeerProvider {
  abstract getTree(activityId: string): Observable<PeerComparisonTreeOutput>
}
