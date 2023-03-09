export interface CourseActivity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  readonly courseId: string;
  readonly sectionId: string;

  readonly openAt?: Date;
  readonly closeAt?: Date;

  readonly title: string;
  readonly state: CourseActivityStates;
  readonly progression: number;
}

export interface CourseActivityFilters {
  readonly sectionId?: string;
}

export interface CreateCourseActivity {
  readonly sectionId: string;

  readonly resourceId: string;
  readonly resourceVersion: string;

  readonly openAt?: Date;
  readonly closeAt?: Date;

  readonly members?: string[];

}

export interface UpdateCourseActivity {
  readonly openAt?: Date;
  readonly closeAt?: Date;

  readonly members?: string[];
}

export type CourseActivityStates = 'opened' | 'closed' | 'planned'

export const courseActivityState = (value: CourseActivity): CourseActivityStates => {
  const now = new Date();
  const openAt = value.openAt ? new Date(value.openAt) : undefined
  const closeAt = value.closeAt ? new Date(value.closeAt) : undefined

  if (openAt && closeAt) {
    if (now < openAt) {
      return 'planned';
    } else if (now >= openAt && now <= closeAt) {
      return 'opened';
    } else {

      return 'closed';
    }
  } else if (openAt) {
    if (now < openAt) {
      return 'planned';
    } else {
      return 'opened';
    }
  } else if (closeAt) {
    if (now <= closeAt) {
      return 'opened';
    } else {
      return 'closed';
    }
  } else {
    return 'opened';
  }
}
