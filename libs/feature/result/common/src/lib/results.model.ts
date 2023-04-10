import { AnswerStates } from "./answer.model";

export interface UserExerciseResults {
  id: string;
  state: AnswerStates;
  title: string;
  grade: number;
  attempts: number;
  duration: number;
  sessionId?: string;
}

export interface UserResults {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  correcting?: boolean;
  exercises: Record<string, UserExerciseResults>
}

export interface ExerciseResults {
  id: string;
  title: string;
  grades: {
    sum: number;
    avg: number;
  },
  attempts: {
    sum: number;
    avg: number;
  },
  durations: {
    sum: number;
    avg: number;
  },
  states: Record<AnswerStates, number>
}

export interface ActivityResults {
  users: UserResults[];
  exercises: ExerciseResults[];
}

export const emptyExerciseResults = (): ExerciseResults => ({
  id: '',
  title: '',
  grades: {
    sum: 0,
    avg: 0
  },
  attempts: {
    sum: 0,
    avg: 0,
  },
  durations: {
    sum: 0,
    avg: 0,
  },
  states: {
    ANSWERED: 0,
    SUCCEEDED: 0,
    PART_SUCC: 0,
    FAILED: 0,
    STARTED: 0,
    NOT_STARTED: 0,
    ERROR: 0
  }
})
