import { Injectable } from '@angular/core'
import { ListResponse } from '@platon/core/common'
import { CreateLms, Lms, LmsFilters, UpdateLms } from '@platon/feature/lti/common'
import { Observable } from 'rxjs'
import { LTIProvider } from '../models/lms-provider'

@Injectable({ providedIn: 'root' })
export class LTIService {
  constructor(private readonly provider: LTIProvider) {}

  searchLms(filters?: LmsFilters): Observable<ListResponse<Lms>> {
    return this.provider.searchLms(filters)
  }

  findLms(id: string): Observable<Lms> {
    return this.provider.findLms(id)
  }

  updateLms(id: string, input: UpdateLms): Observable<Lms> {
    return this.provider.updateLms(id, input)
  }

  createLms(input: CreateLms): Observable<Lms> {
    return this.provider.createLms(input)
  }
}
