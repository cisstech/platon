import { asUuid } from '@platon/core/server'

/** An exercise that crashed before its student could answer still waits for a correction. */
const failedBeforeAnswer = (exercise: string) => `(${exercise}.variables->'.meta'->>'error')::boolean IS TRUE`

/**
 * An exercise its corrector has to look at: answered or crashed, of an exercise that still exists.
 * Shared by the correction queue, its summary and the recent copies, so that all three wait for the
 * same exercises.
 */
export const toCorrect = (exercise: string) => `(
  (
    EXISTS (
      SELECT 1 FROM "Answers" answer
      WHERE answer.session_id = ${exercise}.id AND answer.variables IS NOT NULL
    )
    OR ${failedBeforeAnswer(exercise)}
  )
  AND EXISTS (
    SELECT 1 FROM "Resources" exercise_resource
    WHERE exercise_resource.id = ${asUuid(`${exercise}.source->>'resource'`)}
  )
)`
