import {
  CourseDemo,
  CourseDemoAccessAnswer,
} from '@platon/feature/course/common';
import { Observable } from 'rxjs';
import { Optional } from 'typescript-optional';

export abstract class CourseDemoProvider {
  abstract access(uri: string): Observable<CourseDemoAccessAnswer>;
  abstract create(courseId: string): Observable<CourseDemo>;
  abstract get(courseId: string): Observable<Optional<CourseDemo>>;
  abstract delete(courseId: string): Observable<void>;
}
