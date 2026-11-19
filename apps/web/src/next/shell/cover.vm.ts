import { GlyphName, IconName } from '@platon/design-system'
import { UserRoles, isTeacherRole } from '@platon/core/common'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'

export interface CoverEntry {
  readonly label: string
  readonly icon: IconName
  readonly link: string
  readonly count?: number
  readonly countLabel?: string
}

/** Copies submitted with at least one exercise still to correct, over every activity. */
export const pendingCopies = (summaries: readonly ActivityCorrectionSummary[]): number =>
  summaries.reduce((total, summary) => total + (summary.pendingCopies ?? 0), 0)

const copiesLabel = (count: number): string => (count > 1 ? 'copies à corriger' : 'copie à corriger')

/**
 * The navigation of the cover for a role. Teachers and administrators always have Corrections; a
 * student or a demo account has it once they correct something (`summaries` not empty). Unknown
 * summaries (still loading, or failed) count as none.
 */
export const coverEntries = (role: UserRoles, summaries: readonly ActivityCorrectionSummary[] = []): CoverEntry[] => {
  const teacher = isTeacherRole(role)
  const toCorrect = pendingCopies(summaries)
  const entries: CoverEntry[] = [
    { label: 'Accueil', icon: 'home', link: '/dashboard' },
    { label: 'Annonces', icon: 'campaign', link: '/announcements' },
    { label: 'Cours', icon: 'school', link: '/courses' },
  ]
  if (teacher || summaries.length) {
    entries.push({
      label: 'Corrections',
      icon: 'rate_review',
      link: '/corrections',
      ...(toCorrect ? { count: toCorrect, countLabel: copiesLabel(toCorrect) } : {}),
    })
  }
  if (teacher) {
    entries.push(
      { label: 'Ressources', icon: 'folder_open', link: '/resources' },
      { label: "Tests d'entrée", icon: 'fact_check', link: '/tests' }
    )
  }
  if (role === UserRoles.admin) entries.push({ label: 'Administration', icon: 'shield_person', link: '/admin' })
  return entries
}

/** The type of account shown under the name: what the platform knows, never a gender. */
export const accountType = (role: UserRoles): string =>
  ({
    [UserRoles.admin]: 'Compte administrateur',
    [UserRoles.teacher]: 'Compte enseignant',
    [UserRoles.student]: 'Compte étudiant',
    [UserRoles.demo]: 'Compte de démonstration',
    [UserRoles.candidate]: 'Compte candidat',
  }[role])

/** Teachers and administrators have the documentation in the foot; the others find it as Aide in their profile. */
export const helpInFoot = (role: UserRoles): boolean => isTeacherRole(role)

export type CreateKind = 'course' | 'activity' | 'exercise' | 'circle'

export interface CreateEntry {
  readonly kind: CreateKind
  readonly label: string
  readonly glyph: GlyphName
  readonly description: string
}

/** What the Create menu offers, in the order the objects nest; nothing for a student. */
export const createEntries = (role: UserRoles): CreateEntry[] => {
  if (!isTeacherRole(role)) return []
  const entries: CreateEntry[] = [
    {
      kind: 'course',
      label: 'Cours',
      glyph: 'course',
      description: "L'espace de vos étudiants, avec vos activités rangées en sections : semaines, chapitres.",
    },
    {
      kind: 'activity',
      label: 'Activité',
      glyph: 'activity',
      description: "Une série d'exercices à faire dans un cours, avec des dates et, si vous le voulez, une note.",
    },
    {
      kind: 'exercise',
      label: 'Exercice',
      glyph: 'exercise',
      description:
        "Une question corrigée automatiquement. Partez d'un modèle (QCM, programme avec tests, texte à trous) ou écrivez-la en code.",
    },
  ]
  if (role === UserRoles.admin) {
    entries.push({
      kind: 'circle',
      label: 'Cercle',
      glyph: 'circle',
      description: "Un espace partagé pour les ressources d'une équipe.",
    })
  }
  return entries
}

/** The resource open at `url`, which becomes the parent of what is created: `/resources/:id`. */
export const parentResource = (url: string): string | undefined => {
  const [path] = url.split(/[?#]/)
  const [first, second] = path.split('/').filter(Boolean)
  return first === 'resources' && second && second !== 'create' ? second : undefined
}

export interface CreateTarget {
  readonly path: string
  readonly queryParams?: Record<string, string>
}

const RESOURCE_TYPES: Record<Exclude<CreateKind, 'course'>, string> = {
  activity: 'ACTIVITY',
  exercise: 'EXERCISE',
  circle: 'CIRCLE',
}

/** Where creating `kind` starts, from the page at `url`. */
export const createTarget = (kind: CreateKind, url: string): CreateTarget => {
  if (kind === 'course') return { path: '/courses/create' }
  const parent = parentResource(url)
  return { path: '/resources/create', queryParams: { type: RESOURCE_TYPES[kind], ...(parent ? { parent } : {}) } }
}
