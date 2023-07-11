export interface CourseDemo {
  readonly courseId: string
  readonly uri: string
}

export interface CourseDemoAccessResponse {
  readonly courseId: string;
  readonly auth: boolean;
  readonly accessToken?: string;
  readonly refreshToken?: string;
}

export interface CourseDemoGetResponse {
    readonly demoExists: boolean;
    readonly demo?: CourseDemo;
}