export interface CourseDemo {
  readonly courseId: string;
  readonly uri: string;
}

export interface CourseDemoAccessAnswer {
  readonly courseId: string;
  readonly auth: boolean;
  readonly accessToken?: string;
  readonly refreshToken?: string;
}
