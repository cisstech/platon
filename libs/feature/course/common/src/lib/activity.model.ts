export interface CourseActivity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly order: number;
  readonly courseId: string;
  readonly sectionId: string;
  readonly activityId: string;
}
