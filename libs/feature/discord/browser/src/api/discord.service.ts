import { Injectable } from '@angular/core'
import { DiscordProvider } from '../models/discord-provider'
import { Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class DiscordService {
  constructor(private readonly provider: DiscordProvider) {}

  getInvitationLink(): Observable<string> {
    return this.provider.getInvitationLink()
  }
}
