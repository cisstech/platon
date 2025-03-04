import { LevelEntity } from './level.entity'

export const ON_LEVEL_FUSION_EVENT = 'level.fusion'

export interface OnLevelFusionEventPayload {
  oldLevel: LevelEntity
  newLevel: LevelEntity
}
