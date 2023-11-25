import { PlayerActivityVariables, PlayerExercise } from '@platon/feature/player/common'
import { AnswerStates } from '@platon/feature/result/common'

export const updateActivityNavigationState = (
  activityVariables: PlayerActivityVariables,
  currentSessionId?: string
) => {
  const { navigation, settings } = activityVariables
  navigation.started = true
  const markAsStarted = (exercise: PlayerExercise) => {
    if (exercise.state === AnswerStates.NOT_STARTED) {
      exercise.state = AnswerStates.STARTED
    }
  }
  if (settings?.navigation?.mode === 'manual') {
    navigation.current = navigation.exercises.find((item) => {
      if (item.sessionId === currentSessionId) {
        markAsStarted(item)
        return true
      }
      return false
    }) as PlayerExercise
  } else if (settings?.navigation?.mode === 'composed') {
    navigation.exercises.forEach(markAsStarted)
  }
}
