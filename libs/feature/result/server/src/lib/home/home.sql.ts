import { asUuid } from '@platon/core/server'
import { UNANSWERED_STATES } from '@platon/feature/result/common'

const jsonArray = (value: string) => `CASE jsonb_typeof(${value}) WHEN 'array' THEN ${value} ELSE '[]'::jsonb END`

/** Whether a jsonb value is `true`. */
export const isTrue = (json: string) => `COALESCE(${json} = 'true'::jsonb, FALSE)`

/**
 * The parts of an activity's source the homes read, `variables` and `resource_key`, taken out once:
 * the source embeds every exercise, and each read of it decompresses it again.
 */
export const activitySource = (activity: string) => `
  CROSS JOIN LATERAL (
    SELECT ${activity}.source->'variables' AS variables, ${activity}.source->>'resource' AS resource_key OFFSET 0
  ) activity_source`

/** The resource an activity was made from, joined on its primary key. */
export const activityResource = (resource: string) =>
  `LEFT JOIN "Resources" ${resource} ON ${resource}.id = ${asUuid('activity_source.resource_key')}`

/** The title of an activity: its own, else the name of the resource it was made from. */
export const activityTitle = (resource: string) =>
  `COALESCE(NULLIF(btrim(activity_source.variables->>'title'), ''), ${resource}.name, '')`

/** Whether the activity's dates come from restriction periods, which differ from one student to another. */
export const isRestricted = (activity: string) => `(
  ${activity}.ignore_restrictions IS NOT TRUE
  AND jsonb_typeof(${activity}.restrictions) = 'array'
  AND ${activity}.restrictions <> '[]'::jsonb
)`

/**
 * The exercises of an activity for a person: those of their copy once it has some, as the progress
 * of an activity counts them, else those of the source, its groups stored as an object or an array,
 * as `normalizeExerciseGroups` reads them.
 */
export const exerciseCount = (navigation: string) => {
  const groups = `activity_source.variables->'exerciseGroups'`
  const groupExercises = jsonArray("exercise_group->'exercises'")
  return `COALESCE(
    NULLIF(jsonb_array_length(${jsonArray(`${navigation}->'exercises'`)}), 0),
    (
      SELECT COALESCE(SUM(jsonb_array_length(
        CASE jsonb_typeof(exercise_group) WHEN 'array' THEN exercise_group ELSE ${groupExercises} END
      )), 0)::int
      FROM jsonb_array_elements(
        CASE jsonb_typeof(${groups})
          WHEN 'array' THEN ${groups}
          WHEN 'object' THEN (SELECT COALESCE(jsonb_agg(value), '[]'::jsonb) FROM jsonb_each(${groups}))
          ELSE '[]'::jsonb
        END
      ) exercise_group
    )
  )`
}

/** The exercises of a copy its student answered, by `isExerciseDone`. */
export const exercisesDone = (navigation: string) => `(
  SELECT COUNT(*)::int
  FROM jsonb_array_elements(${jsonArray(`${navigation}->'exercises'`)}) navigation_exercise
  WHERE navigation_exercise->>'state' NOT IN (${UNANSWERED_STATES.map((state) => `'${state}'`).join(', ')})
)`

/**
 * The grade of a copy on 100, as the player computes it: the mean of its exercises, the corrected
 * grade first, an exercise without an answer counting 0.
 */
export const copyGrade = (copy: string) => `(
  SELECT ROUND(AVG(COALESCE(exercise_correction.grade, GREATEST(copy_exercise.grade, 0)))::numeric, 2)::float
  FROM "Sessions" copy_exercise
  LEFT JOIN "Corrections" exercise_correction ON exercise_correction.id = copy_exercise.correction_id
  WHERE copy_exercise.parent_id = ${copy}.id
)`
