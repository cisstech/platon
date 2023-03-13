import { AnswerStates } from "@platon/feature/player/common";

export interface UserResults {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  exercises: Record<string, {
    id: string;
    state: AnswerStates;
    title: string;
    grade: number;
    attempts: number;
    duration: number;
  }>
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


export interface TeacherResultsData {
  users: UserResults[];
  exercises: ExerciseResults[];
}
