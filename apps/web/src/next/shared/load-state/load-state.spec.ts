import { LiveAnnouncer } from '@angular/cdk/a11y'
import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { LoadPhase } from '@platon/design-system'
import { Connectivity } from '../../core/connectivity/connectivity'
import { LoadState, failureCause } from './load-state'

@Component({
  imports: [LoadState],
  template: `
    <app-load-state
      [phase]="phase()"
      [level]="level()"
      heading="Votre accueil n'a pas pu être chargé"
      reassurance="Vos réponses déjà validées sont enregistrées."
      (retry)="retries = retries + 1"
    >
      <a href="/courses" appLoadStateExit>Revenir à mes cours</a>
    </app-load-state>
  `,
})
class Host {
  readonly phase = signal<LoadPhase>('quiet')
  readonly level = signal<2 | 3>(2)
  retries = 0
}

describe('LoadState', () => {
  let fixture: ComponentFixture<Host>
  let announce: jest.Mock
  const online = signal(true)
  const el = () => fixture.nativeElement as HTMLElement
  const show = (phase: LoadPhase) => {
    fixture.componentInstance.phase.set(phase)
    fixture.detectChanges()
  }

  beforeEach(() => {
    online.set(true)
    announce = jest.fn().mockResolvedValue(undefined)
    TestBed.configureTestingModule({
      providers: [
        { provide: Connectivity, useValue: { online } },
        { provide: LiveAnnouncer, useValue: { announce } },
      ],
    })
    fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
  })

  it.each(['quiet', 'skeleton', 'ready'] as LoadPhase[])('says nothing while %s', (phase) => {
    show(phase)
    expect(el().querySelector('pl-alert, pl-empty')).toBeNull()
  })

  it('adds a neutral message after 10 s, and announces it once', () => {
    show('slow')
    const alert = el().querySelector('pl-alert')
    expect(alert?.textContent).toContain("Le chargement prend plus de temps que d'habitude.")
    expect(alert?.textContent).toContain("Nous réessayons, vous n'avez rien à faire.")
    fixture.detectChanges()
    expect(announce).toHaveBeenCalledTimes(1)
    expect(announce).toHaveBeenCalledWith(expect.stringContaining('Nous réessayons'), 'polite')
  })

  it('titles a zone error under its section', () => {
    fixture.componentInstance.level.set(3)
    show('error')
    expect(el().querySelector('pl-empty h3')).not.toBeNull()
  })

  it.each(['error', 'timeout'] as LoadPhase[])('tells a PLaTon outage on %s, and what is safe', (phase) => {
    show(phase)
    const error = el().querySelector('pl-empty')
    expect(error?.getAttribute('role')).toBe('alert')
    expect(error?.querySelector('h2')?.textContent).toBe("Votre accueil n'a pas pu être chargé")
    expect(error?.textContent).toContain("Votre connexion fonctionne, c'est PLaTon qui ne répond pas.")
    expect(error?.textContent).toContain('Vos réponses déjà validées sont enregistrées.')
    expect(error?.querySelector('.pl-empty__pastille use')?.getAttribute('href')).toMatch(/#cloud_off$/)
  })

  it('tells a lost connection apart', () => {
    online.set(false)
    show('timeout')
    const error = el().querySelector('pl-empty')
    expect(error?.textContent).toContain('Votre appareil semble hors connexion.')
    expect(error?.querySelector('.pl-empty__pastille')?.getAttribute('data-tone')).toBe('neutral')
    expect(error?.querySelector('.pl-empty__pastille use')?.getAttribute('href')).toMatch(/#wifi_off$/)
  })

  it('always offers to try again, then the exit it is given', () => {
    show('error')
    const actions = el().querySelector('.pl-empty__actions')
    expect([...(actions?.children ?? [])].map((node) => node.textContent?.trim())).toEqual([
      'Réessayer',
      'Revenir à mes cours',
    ])
    ;(actions?.querySelector('button') as HTMLButtonElement).click()
    expect(fixture.componentInstance.retries).toBe(1)
  })

  it('blames PLaTon only when the device is online', () => {
    expect(failureCause(true)).toBe('server')
    expect(failureCause(false)).toBe('offline')
  })
})
