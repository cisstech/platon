export interface PlayerInput {
  isPreview?: boolean;
  resourceId?: string;
  resourceVersion?: string;
}

export interface ExerciseNavItem {
  id: string;
  title: string;
}

export interface ExerciseGroupNavItem {
  title: string;
  exercises: ExerciseNavItem[];
}

export type NavigationItem = ExerciseNavItem | ExerciseGroupNavItem;

export interface ExerciseLayout {
  type: 'exercise';
  title: string;
  statement: string;
  form: string;
  envid: string;
}

export interface ActivityLayout {
  type: 'activity';
  title: string;
  intro: string;
  envid: string;
  navigation: NavigationItem[];
}

export declare type ResourceLayout = ExerciseLayout | ActivityLayout;
