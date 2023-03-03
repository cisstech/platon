import { Provider } from "@angular/core";
import { CourseProvider } from "./models/course-provider";
import { RemoteCourseProvider } from "./providers/remote-course.provider";

export const COURSE_PROVIDERS: Provider[] = [
  { provide: CourseProvider, useClass: RemoteCourseProvider },
];
