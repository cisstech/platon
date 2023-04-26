import { UpdateUserPrefs, UserPrefs } from '@platon/core/common';
import { Observable } from 'rxjs';

export abstract class UserPrefsProvider {
  abstract find(username: string): Observable<UserPrefs>;
  abstract update(username: string, input: UpdateUserPrefs): Observable<UserPrefs>;
}
