import { ListResponse } from "@platon/core/common";
import { ActivityResults, Correction, PendingCorrection, UpsertCorrection, UserResults } from "@platon/feature/result/common";
import { Observable } from "rxjs";

export abstract class ResultProvider {
  abstract sessionResults(sessionId: string): Observable<UserResults>;
  abstract activityResults(activityId: string): Observable<ActivityResults>;
  abstract upsertCorrection(sessionId: string, input: UpsertCorrection): Observable<Correction>;
  abstract listCorrections(activityId?: string): Observable<ListResponse<PendingCorrection>>;
}
