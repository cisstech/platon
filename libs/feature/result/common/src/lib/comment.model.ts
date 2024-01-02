export interface SessionComment {
  id: string
  createdAt: Date
  updatedAt: Date
  authorId: string
  sessionId: string
  answerId: string
  comment: string
}

export interface CreateSessionComment {
  comment: string
}
