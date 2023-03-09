import { Pipe, PipeTransform } from '@angular/core';
import { CourseActivity, CourseActivityStates } from '@platon/feature/course/common';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import fr from 'date-fns/locale/fr';

interface State {
  color: string;
  state: CourseActivityStates;
  label: string
}

const LABELS: Record<CourseActivityStates, string> = {
  opened: 'Ouvert',
  closed: 'Fermé',
  planned: 'Ouvre dans'
}

@Pipe({
  name: 'courseActivityState'
})

export class CourseActivityStatePipe implements PipeTransform {
  transform(value: CourseActivity): State {
    return ({
      'opened': () => ({ color: 'lime', state: 'opened', label: LABELS['opened'] }),
      'closed': () => ({ color: 'volcano', state: 'closed', label: LABELS['closed'] }),
      'planned': () => ({
        color: 'blue',
        state: 'planned',
        label: LABELS['planned'] + ` ${formatDistanceToNow(new Date(value.openAt as unknown as string), { locale: fr })}`
      }),
    })[value.state]() as State
  }
}
