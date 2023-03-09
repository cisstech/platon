import { AnswerStates } from "./answer.model";

export interface PlayerPage {
  id: string;
  sessionId: string;
  state: AnswerStates;
  title: string;
}

export interface PlayerNavigation {
  started: boolean;
  terminated: boolean;
  current?: PlayerPage;
  exercises: PlayerPage[];
}
