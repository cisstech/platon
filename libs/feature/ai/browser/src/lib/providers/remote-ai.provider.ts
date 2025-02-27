import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AiProvider } from '../models/ai-provider'

@Injectable()
export class RemoteAiProvider extends AiProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }
}
