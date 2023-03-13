import { Injectable } from "@angular/core";
import { TeacherResultsData } from "@platon/feature/answer/common";
import { Observable } from "rxjs";
import { AnswerProvider } from "../models/answer-provider";

@Injectable({ providedIn: 'root' })
export class AnswerService {
  constructor(private readonly provider: AnswerProvider) { }

  resultsForTeacher(activityId: string): Observable<TeacherResultsData> {
    return this.provider.resultsForTeacher(activityId);
  }
}
