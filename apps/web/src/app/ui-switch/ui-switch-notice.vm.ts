import { UiBootContext } from '../../shared/ui-boot-context'
import { withUiParam } from '../../ui-switch/ui-url'

/**
 * `bridge`: the new interface sent a screen it does not have yet.
 * `offer`: the new interface is offered to someone who has not chosen yet.
 */
export type UiSwitchNoticeKind = 'bridge' | 'offer'

export interface UiSwitchNoticeInput {
  url: URL
  context: UiBootContext
  offerDismissed: boolean
}

export interface UiSwitchNoticeView {
  kind: UiSwitchNoticeKind
  title?: string
  message: string
  action: { label: string; href: string }
  dismissLabel: string
}

/** Full-screen tools: never covered by the notice. */
const TOOLS = ['player', 'editor', 'builder', 'playground', 'demo']

/** Pages outside the app shell. All the others are behind the auth guard, so being on one means signed in. */
const OUTSIDE_SHELL = [...TOOLS, 'login', 'candidate', '403', '404', '500']

export const uiSwitchNoticeView = (input: UiSwitchNoticeInput): UiSwitchNoticeView | null => {
  const kind = noticeKind(input)
  if (kind === 'bridge') {
    return {
      kind,
      message: "Cette page n'existe pas encore dans la nouvelle interface.",
      action: { label: 'Revenir à la nouvelle interface', href: '/' },
      dismissLabel: 'Masquer',
    }
  }
  if (kind === 'offer') {
    return {
      kind,
      title: 'PLaTon a une nouvelle interface.',
      message: 'Essayez-la, vous pourrez revenir à celle-ci à tout moment.',
      action: { label: 'Essayer la nouvelle interface', href: withUiParam(input.url, 'next') },
      dismissLabel: 'Non merci',
    }
  }
  return null
}

const noticeKind = ({ url, context, offerDismissed }: UiSwitchNoticeInput): UiSwitchNoticeKind | null => {
  const section = url.pathname.split('/')[1] ?? ''
  if (TOOLS.includes(section)) return null
  if (context.bridged) return 'bridge'

  const undecided = context.stored === null && context.flag !== 'off' && !offerDismissed
  return undecided && !OUTSIDE_SHELL.includes(section) ? 'offer' : null
}
