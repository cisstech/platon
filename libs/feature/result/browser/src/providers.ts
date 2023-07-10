import { Provider } from '@angular/core'
import { ResultProvider } from './models/result-provider'
import { RemoteResultProvider } from './providers/remote-result.provider'
import { SessionCommentProvider } from './models/session-comment-provider'
import { RemoteSessionCommentProvider } from './providers/remote-session-comment.provider'

export const RESULT_PROVIDERS: Provider[] = [
  { provide: ResultProvider, useClass: RemoteResultProvider },
  { provide: SessionCommentProvider, useClass: RemoteSessionCommentProvider },
]
