export interface CourseActivity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly order: number;
  readonly courseId: string;
  readonly sectionId: string;
  readonly resouceId: string;
  readonly resourceVersion: string;
}

export interface CourseActivityFilters {
  readonly sectionId?: string;
}

export interface CreateCourseActivity {
  readonly courseId: string;
  readonly sectionId: string;
  readonly resouceId: string;
  readonly resourceVersion: string;
  readonly order: number;
}

export interface UpdateCourseActivity {
  readonly order?: number;
  readonly resourceVersion?: string;
}
