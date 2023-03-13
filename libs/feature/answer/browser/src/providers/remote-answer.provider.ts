import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TeacherResultsData } from "@platon/feature/answer/common";
import { Observable } from "rxjs";
import { AnswerProvider } from "../models/answer-provider";

@Injectable()
export class RemoteAnswerProvider extends AnswerProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  resultsForTeacher(activityId: string): Observable<TeacherResultsData> {
    return this.http.get<TeacherResultsData>(`/api/v1/answers/${activityId}/results/teacher`);
  }
}
