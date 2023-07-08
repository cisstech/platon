import { ExerciseVariables, PLSourceFile } from '@platon/feature/compiler'
import { PlayerActivityVariables } from '@platon/feature/player/common'
import { SessionEntity } from '@platon/feature/result/server'

/**
 * Extracts original source code from the given exercise session.
 * @param exerciseSession An exercise session.
 * @returns An exercise source code or `undefined` if the source code cannot be determined (for backward-compatibility reason).
 */
export const extractExerciseSourceFromSession = (
  exerciseSession: SessionEntity<ExerciseVariables>
): PLSourceFile | undefined => {
  if (exerciseSession.source) {
    return exerciseSession.source
  }

  if (exerciseSession.parent) {
    const activitySession = exerciseSession.parent as SessionEntity<PlayerActivityVariables>
    const activityExercises = Object.values(activitySession.variables.exerciseGroups).flat()
    const activityNavigation = activitySession.variables.navigation.exercises
    const exerciseId = activityNavigation.find((item) => item.sessionId === exerciseSession.id)?.id
    if (exerciseId) {
      return activityExercises.find((item) => item.id === exerciseId)?.source
    }
  }
  return undefined
}
