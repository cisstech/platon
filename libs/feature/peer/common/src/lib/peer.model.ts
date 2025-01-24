import { User } from '@platon/core/common'
import { Answer } from '@platon/feature/result/common'

export interface PeerOutput {
  id: string
  answer1: Answer
  answer2: Answer
}

export interface PeerComparisonTree {
  id: string
  name: string
  level: number
  value: string
  status: MatchStatus
  player1: string
  player2: string
  nbWinsPlayer1: number
  nbWinsPlayer2: number
  winnerId: string
  children: PeerComparisonTree[]
}

export interface PeerComparisonTreeOutput {
  name: string
  trees: PeerComparisonTree[]
  maxLevel: number
  nbLeaves: number
}

export interface PeerMatch {
  id: string
  createdAt: Date
  updatedAt: Date
  activityId: string
  player1Id: string
  player2Id: string
  player1SessionId: string
  player2SessionId: string
  games: PeerGame[]
  level: number
  status: MatchStatus
  winnerId: string
}

export interface PeerGame {
  id: string
  createdAt: Date
  updatedAt: Date
  matchId: string
  winnerId: string
  corrector: User
}

export enum MatchStatus {
  Pending = 'pending', // Waiting for more correctors
  Running = 'running', // Waiting for the correctors to finish
  Next = 'next', // Waiting for the winner to be added to his next match
  Done = 'done', // The match is finished
}

export interface PeerContest {
  player1: string
  player2: string
  answerP1: string // SessionId
  answerP2: string // SessionId
  peerId: string
  level: number
}
