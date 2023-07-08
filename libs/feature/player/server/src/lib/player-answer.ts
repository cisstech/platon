import { Variables } from '@platon/feature/compiler'
import { SessionEntity } from '@platon/feature/result/server'

/**
 * Merges user answers with the session variables.
 * @param session Session in which the answers must be merged
 * @param answers Answers to merge in the session.
 * @returns The session computed with the answers.
 */
export const withAnswersInSession = (session: SessionEntity, answers: Variables): SessionEntity => {
  const components: Variables = {}

  const searchComponentsIn = (variables: Variables) => {
    for (const key in variables) {
      const value = variables[key]
      if (typeof value === 'object') {
        if (value.cid && value.selector) {
          components[value.cid] = value
        } else {
          searchComponentsIn(value)
        }
      } else if (Array.isArray(value)) {
        value.forEach(searchComponentsIn)
      }
    }
  }

  searchComponentsIn(session.variables)

  for (const cid in answers) {
    if (cid in components) {
      Object.assign(components[cid], answers[cid])
    }
  }

  return session
}
