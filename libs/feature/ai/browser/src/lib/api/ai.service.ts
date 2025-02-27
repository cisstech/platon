import { inject, Injectable } from '@angular/core'
import { AiProvider } from '../models/ai-provider'

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly provider = inject(AiProvider)

}
