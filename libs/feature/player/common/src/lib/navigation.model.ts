/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnswerStates } from "./answer.model";

export interface PlayerPage {
  state: AnswerStates;
  title: string;
  sessionId: string;
}

export interface PlayerNavigation {
  started: boolean;
  terminated: boolean;
  current?: PlayerPage;
  exercises: PlayerPage[];
}
