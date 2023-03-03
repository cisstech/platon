export interface CourseSection {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly name: string;
  readonly order: number;
  readonly courseId: string;
}
