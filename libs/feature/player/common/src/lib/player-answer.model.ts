import { Variables } from '@platon/feature/compiler'

/**
 * Merges user answers into the session variables.
 * @param sessionVars Variables on which to merge the answers.
 * @param answerVars Answers to merge.
 */
export const withAnswersInSession = (sessionVars: Variables, answerVars: Variables): void => {
  const components: Record<string, Variables[]> = {}

  const searchComponents = (variables: Variables) => {
    for (const key in variables) {
      const value = variables[key]
      if (value == null) continue
      if (typeof value === 'object') {
        if (value.cid && value.selector) {
          components[value.cid] = components[value.cid] ?? []
          components[value.cid].push(value)
        } else {
          searchComponents(value)
        }
      } else if (Array.isArray(value)) {
        value.forEach(searchComponents)
      }
    }
  }

  searchComponents(sessionVars)

  for (const cid in answerVars) {
    if (cid in components) {
      components[cid].forEach((component) => {
        Object.assign(component, answerVars[cid])
      })
    }
  }
}
