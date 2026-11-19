import { UiBootContext } from '../../shared/ui-boot-context'
import { uiSwitchNoticeView } from './ui-switch-notice.vm'

const noticeOn = (path: string, context: Partial<UiBootContext>, offerDismissed = false) =>
  uiSwitchNoticeView({
    url: new URL(path, 'https://platon.test'),
    context: { flag: 'off', stored: null, bridged: false, ...context },
    offerDismissed,
  })

describe('uiSwitchNoticeView', () => {
  describe('bridge', () => {
    it('tells that the screen is not in the new interface yet, and leads back to its home', () => {
      expect(noticeOn('/courses/42/members', { bridged: true })).toEqual({
        kind: 'bridge',
        message: "Cette page n'existe pas encore dans la nouvelle interface.",
        action: { label: 'Revenir à la nouvelle interface', href: '/' },
        dismissLabel: 'Masquer',
      })
    })

    it('also shows outside the app shell, on the login page', () => {
      expect(noticeOn('/login?next=%2Fcourses', { bridged: true })?.kind).toBe('bridge')
    })

    it('never covers a full-screen tool', () => {
      for (const path of ['/player/activity/1', '/editor/1?version=latest', '/builder/1', '/playground', '/demo/1']) {
        expect(noticeOn(path, { bridged: true })).toBeNull()
      }
    })
  })

  describe('offer', () => {
    it('offers to try the new interface at the same address', () => {
      expect(noticeOn('/courses/42?tab=members', { flag: 'opt-in' })).toEqual({
        kind: 'offer',
        title: 'PLaTon a une nouvelle interface.',
        message: 'Essayez-la, vous pourrez revenir à celle-ci à tout moment.',
        action: { label: 'Essayer la nouvelle interface', href: '/courses/42?tab=members&ui=next' },
        dismissLabel: 'Non merci',
      })
    })

    it('is made once the new interface is open to all', () => {
      expect(noticeOn('/dashboard', { flag: 'default' })?.kind).toBe('offer')
    })

    it('is not made while the flag is off', () => {
      expect(noticeOn('/dashboard', { flag: 'off' })).toBeNull()
    })

    it('is not made again after « Non merci »', () => {
      expect(noticeOn('/dashboard', { flag: 'opt-in' }, true)).toBeNull()
    })

    it('is not made to someone who chose the current interface', () => {
      expect(noticeOn('/dashboard', { flag: 'opt-in', stored: 'legacy' })).toBeNull()
    })

    it('is only made on the pages of the app shell, where people are signed in', () => {
      for (const path of ['/login', '/candidate/terms', '/404', '/player/activity/1']) {
        expect(noticeOn(path, { flag: 'opt-in' })).toBeNull()
      }
    })

    it('reads whole path segments', () => {
      expect(noticeOn('/loginhelp', { flag: 'opt-in' })?.kind).toBe('offer')
    })
  })
})
