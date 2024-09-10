import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { DiscordProvider } from '../models/discord-provider'
import { Observable } from 'rxjs'

@Injectable()
export class RemoteDiscordService extends DiscordProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  getInvitationLink(): Observable<string> {
    return this.http.get('api/v1/discord/invitation', { responseType: 'text' })
  }
}
