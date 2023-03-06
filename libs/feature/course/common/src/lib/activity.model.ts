export interface CourseActivity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  readonly order: number;

  readonly courseId: string;
  readonly sectionId: string;

  readonly openAt?: Date;
  readonly closeAt?: Date;
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
  readonly order?: number;

  readonly openAt?: Date;
  readonly closeAt?: Date;

  readonly members?: string[];
}
