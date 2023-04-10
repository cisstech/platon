import { PlayerActivityVariables, PlayerExercise } from "@platon/feature/player/common";
import { AnswerStates } from "@platon/feature/result/common";

export const updateActivityNavigationState = (
  activityVariables: PlayerActivityVariables,
  currentSessionId?: string
) => {
  const { navigation, settings } = activityVariables
  navigation.started = true;
  const markAsStarted = (exercise: PlayerExercise) => {
    if (exercise.state === AnswerStates.NOT_STARTED) {
      exercise.state = AnswerStates.STARTED;
    }
  }
  if ('manual' === settings?.navigation?.mode) {
    navigation.current = navigation.exercises.find(item => {
      if (item.sessionId === currentSessionId) {
        markAsStarted(item)
        return true;
      }
      return false;
    }) as PlayerExercise;
  } else if ('composed' === settings?.navigation?.mode) {
    navigation.exercises.forEach(markAsStarted);
  }
}
