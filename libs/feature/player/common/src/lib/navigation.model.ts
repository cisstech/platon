/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnswerStates } from "./answer.model";

export interface PlayerPage {
  state: AnswerStates;
  sessionId: string;
  resourceId: string;
  resourceName: string;
  resourceVersion?: string;
  variableOverrides?: any;
}

export interface PlayerNavigation {
  started: boolean;
  terminated: boolean;

  /** Current active page (undefined if ) */
  current?: PlayerPage;
  items: PlayerPage[];
}
