import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { PeerMatchEntity } from './entities/peerMatch.entity'
import { PeerGameEntity } from './entities/peerGame.entity'
import { PeerComparisonTreeOutput, MatchStatus, PeerContest, PeerComparisonTree } from '@platon/feature/peer/common'

@Injectable()
export class PeerService {
  constructor(
    @InjectRepository(PeerMatchEntity) private readonly matchRepository: Repository<PeerMatchEntity>,
    @InjectRepository(PeerGameEntity) private readonly gameRepository: Repository<PeerGameEntity>
  ) {}

  async createMatch(input: Partial<PeerMatchEntity>): Promise<PeerMatchEntity> {
    //check if player already answered
    if (input.level === 0 && input.activityId && input.activityId) {
      const match = await this.matchRepository.findOne({
        where: {
          activityId: input.activityId,
          player1Id: input.player1Id,
          level: 0,
        },
      })
      if (match) {
        throw new Error("You can't answer twice")
      }
    }

    return this.matchRepository.save(input)
  }

  async resolveGame(gameId: string, winner: number): Promise<void> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } })
    if (!game) {
      throw new Error('Game not found')
    }
    if (game.winnerId) {
      throw new Error('Game already resolved')
    }
    const match = await this.matchRepository.findOne({
      where: { id: game.matchId },
      relations: ['games', 'player1', 'player2'],
    })
    if (!match) {
      throw new Error('Match not found')
    }
    const winnerId = winner === 1 ? match.player1Id : match.player2Id
    game.winnerId = winnerId
    game.winner = winnerId === match.player1Id ? match.player1 : match.player2
    if (match.games) {
      const player1Wins =
        match.games.filter((game) => game.winnerId === match.player1Id).length + (winnerId === match.player1Id ? 1 : 0)
      const player2Wins =
        match.games.filter((game) => game.winnerId === match.player2Id).length + (winnerId === match.player2Id ? 1 : 0)

      if (player1Wins > match.level) {
        match.winnerId = match.player1Id
        match.winnerSessionId = match.player1SessionId
        match.winner = match.player1
        match.status = MatchStatus.Next
      } else if (player2Wins > match.level) {
        match.winnerId = match.player2Id
        match.winnerSessionId = match.player2SessionId
        match.winner = match.player2
        match.status = MatchStatus.Next
      }
    }
    await this.gameRepository.update(game.id, {
      winnerId: game.winnerId,
      winner: game.winner,
    })
    if (match.status === MatchStatus.Next) {
      await this.matchRepository.update(match.id, {
        winnerId: match.winnerId,
        winnerSessionId: match.winnerSessionId,
        winner: match.winner,
        status: match.status,
      })
    }
  }

  private extractAndRemove<T>(array: Array<T>, predicate: (value: T) => boolean): Array<T> {
    const extracted = []

    for (let i = array.length - 1; i >= 0; i--) {
      // Iterate backward to avoid index shifting
      if (predicate(array[i])) {
        extracted.push(array[i])
        array.splice(i, 1) // Remove element from the original array
      }
    }

    return extracted
  }

  async getTournamentTree(activityId: string): Promise<PeerComparisonTreeOutput> {
    const matches = await this.matchRepository.find({
      where: { activityId },
      relations: ['games', 'player1', 'player2'],
    })
    const result: PeerComparisonTreeOutput = {
      name: 'Tournament',
      maxLevel: 0,
      nbLeaves: 0,
      trees: [],
    }
    const matchesByLevel: { [key: number]: PeerMatchEntity[] } = {}
    matches.forEach((match) => {
      if (!matchesByLevel[match.level]) {
        matchesByLevel[match.level] = []
      }
      matchesByLevel[match.level].push(match)
    })
    const levels = Object.keys(matchesByLevel).map((level) => parseInt(level, 10))
    levels.sort((a, b) => b - a)
    result.nbLeaves = matchesByLevel[0]?.length ?? 0
    result.maxLevel = levels[0]
    levels.forEach((level) => {
      matchesByLevel[level].forEach((match) => {
        result.trees.push(this.buildTree(match, matchesByLevel))
      })
    })
    return result
  }

  buildTree(match: PeerMatchEntity, matchesByLevel: { [key: number]: PeerMatchEntity[] }): PeerComparisonTree {
    const nbWinsPlayer1 = match.games.filter((game) => game.winnerId === match.player1Id).length
    const nbWinsPlayer2 = match.games.filter((game) => game.winnerId === match.player2Id).length
    const player1Name = `${match.player1?.firstName} ${match.player1?.lastName.at(0) ?? ''}.`
    const player2Name = `${match.player2?.firstName} ${match.player2?.lastName.at(0) ?? ''}.`

    const matchNode: PeerComparisonTree = {
      name: match.winnerId ? (match.player1.id === match.winnerId ? player1Name : player2Name) : `EN COURS`,
      id: match.id,
      level: match.level,
      status: match.status,
      player1: player1Name,
      player2: player2Name,
      nbWinsPlayer1,
      nbWinsPlayer2,
      winnerId: match.winnerId,
      value: match.id,
      children: [],
    }
    if (match.level === 0) {
      return matchNode
    }
    const children = this.extractAndRemove(
      matchesByLevel[match.level - 1],
      (m) => m.winnerId === match.player1Id || m.winnerId === match.player2Id
    )
    children.forEach((child) => {
      matchNode.children.push(this.buildTree(child, matchesByLevel))
    })
    return matchNode
  }

  async createGame(input: Partial<PeerGameEntity>): Promise<PeerGameEntity> {
    const entity = this.gameRepository.create(input)
    return this.gameRepository.save(entity)
  }

  async update(input: Partial<PeerMatchEntity>): Promise<PeerMatchEntity> {
    return this.matchRepository.save(input)
  }

  async findById(id: string): Promise<Optional<PeerMatchEntity>> {
    return Optional.ofNullable(
      await this.matchRepository.findOne({
        where: { id },
      })
    )
  }

  findAll(): Promise<[PeerMatchEntity[], number]> {
    return this.matchRepository.findAndCount()
  }

  async findAllPeerOfActivity(activityId: string, status?: MatchStatus): Promise<PeerMatchEntity[]> {
    return this.matchRepository
      .find({
        where: { activityId },
        relations: {
          games: true,
        },
      })
      .then((matches) => {
        switch (status) {
          case MatchStatus.Pending:
            // Take matches with a maximum of level - max( number of wins of each player) games
            return matches.filter((match) => {
              // Number of wins of each player
              const player1Wins = match.games.filter((game) => game.winnerId === match.player1Id).length
              const player2Wins = match.games.filter((game) => game.winnerId === match.player2Id).length
              const nbGamesToLaunch: number = match.level - Math.max(player1Wins, player2Wins)
              return nbGamesToLaunch > 0
            })
          case MatchStatus.Done:
            return matches.filter((match) => match.winnerId !== null)
          default:
            return matches
        }
      })
  }

  /**
   * When called tries to create all the matches for the activity
   * If level is provided, only create the matches for this level
   * @param activityId
   * @param level
   * @returns {Promise<PeerMatchEntity[]>} The pending matches created
   */
  async createMatchs(activityId: string, level?: number): Promise<PeerMatchEntity[]> {
    // For each level of the activity, get players that have not been matched yet
    // Get all winners of each level
    const winnersByLevel: { winnerIdsMatchIds: string[]; level: number }[] = await this.matchRepository
      .createQueryBuilder('peerComparison')
      .select([
        '"level" as "level"',
        'array_agg("winner_id" || \',\' || "winner_session_id" || \',\'|| "id") as "winnerIdsMatchIds"',
      ])
      .where('activity_id = :activityId', { activityId })
      .andWhere('status = :status', { status: MatchStatus.Next })
      .groupBy('level')
      .getRawMany()

    const MatchIdsToFinish: string[] = []
    const pendingMatches: PeerMatchEntity[] = []

    for (const winnerIds of winnersByLevel) {
      while (winnerIds.winnerIdsMatchIds.length > 1) {
        const [player1Id, winnerSessionId1, matchId1] = winnerIds.winnerIdsMatchIds.pop()!.split(',')
        const [player2Id, winnerSessionId2, matchId2] = winnerIds.winnerIdsMatchIds.pop()!.split(',')
        const peerMatchEntity: PeerMatchEntity = await this.createMatch({
          activityId,
          level: winnerIds.level + 1,
          player1Id: player1Id,
          player1SessionId: winnerSessionId1,
          player2Id: player2Id,
          player2SessionId: winnerSessionId2,
        })
        pendingMatches.push(peerMatchEntity)
        MatchIdsToFinish.push(matchId1, matchId2)
      }
    }

    // Finish the matches
    if (MatchIdsToFinish.length) {
      await this.matchRepository
        .createQueryBuilder('peerComparison')
        .update(PeerMatchEntity)
        .set({ status: MatchStatus.Done })
        .where('id IN (:...MatchIdsToFinish)', { MatchIdsToFinish })
        .execute()
    }

    return pendingMatches
  }

  async getNextCopy(correctorId: string, activityId: string): Promise<PeerContest | null> {
    let pendingMatches: PeerMatchEntity[] = await this.matchRepository.find({
      where: {
        activityId,
        status: MatchStatus.Pending,
        player1Id: Not(correctorId),
        player2Id: Not(correctorId),
      },
      relations: ['games'],
    })
    if (pendingMatches.length === 0) {
      pendingMatches = await this.createMatchs(activityId)
    }

    pendingMatches = pendingMatches.filter((match) => {
      return (
        !match.games?.find((game) => game.correctorId === correctorId) &&
        match.player1Id !== correctorId &&
        match.player2Id !== correctorId
      )
    })

    if (pendingMatches.length === 0) {
      return null
    }

    const peerGameEntity: PeerGameEntity = await this.createGame({
      matchId: pendingMatches[0].id,
      correctorId,
    })

    return {
      peerId: peerGameEntity.id,
      player1: pendingMatches[0].player1Id,
      player2: pendingMatches[0].player2Id,
      answerP1: pendingMatches[0].player1SessionId,
      answerP2: pendingMatches[0].player2SessionId,
      level: pendingMatches[0].level,
    }
  }
}
