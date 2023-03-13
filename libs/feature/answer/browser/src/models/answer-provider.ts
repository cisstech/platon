import { TeacherResultsData } from "@platon/feature/answer/common";
import { Observable } from "rxjs";


export abstract class AnswerProvider {
  abstract resultsForTeacher(activityId: string): Observable<TeacherResultsData>;
}
