import { ListResponse } from '@platon/core/common'
import { CreateLms, Lms, LmsFilters, UpdateLms } from '@platon/feature/lti/common'
import { Observable } from 'rxjs'

export abstract class LTIProvider {
  abstract searchLms(filters?: LmsFilters): Observable<ListResponse<Lms>>
  abstract findLms(id: string, markAsViewed?: boolean): Observable<Lms>
  abstract updateLms(id: string, input: UpdateLms): Observable<Lms>
  abstract createLms(input: CreateLms): Observable<Lms>
}
