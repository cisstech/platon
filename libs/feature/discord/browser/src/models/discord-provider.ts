import { Observable } from 'rxjs'

export abstract class DiscordProvider {
  abstract getInvitationLink(): Observable<string>
}
