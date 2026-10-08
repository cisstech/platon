import { LiveAnnouncer } from '@angular/cdk/a11y'
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core'
import { Alert, Button, Empty, Icon, LoadPhase, hasFailed } from '@platon/design-system'
import { Connectivity } from '../../core/connectivity/connectivity'

/** Who failed: PLaTon, or the connection of the person. */
export type FailureCause = 'server' | 'offline'

export const failureCause = (online: boolean): FailureCause => (online ? 'server' : 'offline')

const SLOW_HEADING = "Le chargement prend plus de temps que d'habitude."
const SLOW_TEXT = "Nous réessayons, vous n'avez rien à faire."

const CAUSES: Record<FailureCause, string> = {
  server: "Votre connexion fonctionne, c'est PLaTon qui ne répond pas.",
  offline: 'Votre appareil semble hors connexion. Vérifiez le réseau, puis réessayez.',
}

/**
 * What a screen says about its loading, beside its skeleton: a neutral message after 10 s, then an
 * error that tells a PLaTon outage from a lost connection, says what is safe, and offers
 * « Réessayer ». A second exit, only if it leads somewhere that works, goes in `appLoadStateExit`.
 * The slow message is announced through the live announcer: a status region inserted with its text
 * is not read by every screen reader.
 */
@Component({
  selector: 'app-load-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Alert, Button, Empty, Icon],
  template: `
    @if (phase() === 'slow') {
    <pl-alert icon="hourglass_empty" [heading]="slowHeading">
      <p>{{ slowText }}</p>
    </pl-alert>
    } @else if (failed()) {
    <pl-empty
      role="alert"
      [heading]="heading()"
      [icon]="cause() === 'server' ? 'cloud_off' : 'wifi_off'"
      [tone]="cause() === 'server' ? 'danger' : 'neutral'"
      [code]="code()"
      [level]="level()"
      [compact]="compact()"
    >
      <p>{{ causeText() }} {{ reassurance() }}</p>
      <button type="button" plButton variant="primary" plEmptyAction (click)="retry.emit()">
        <pl-icon name="replay" />Réessayer
      </button>
      <ng-container ngProjectAs="[plEmptyAction]"><ng-content select="[appLoadStateExit]" /></ng-container>
    </pl-empty>
    }
  `,
})
export class LoadState {
  readonly phase = input.required<LoadPhase>()
  /** What could not be loaded, such as « Votre accueil n'a pas pu être chargé ». */
  readonly heading = input.required<string>()
  /** What is safe, such as « Vos réponses déjà validées sont enregistrées. » */
  readonly reassurance = input('')
  /** The code of a page error, such as « Erreur 503 ». */
  readonly code = input<string>()
  /** The smaller form, for a zone of a page. */
  readonly compact = input(false, { transform: booleanAttribute })
  /** Level of the heading: 3 for a zone under a section title. */
  readonly level = input<2 | 3>(2)
  readonly retry = output<void>()

  private readonly online = inject(Connectivity).online
  protected readonly failed = computed(() => hasFailed(this.phase()))
  protected readonly cause = computed(() => failureCause(this.online()))
  protected readonly causeText = computed(() => CAUSES[this.cause()])
  protected readonly slowHeading = SLOW_HEADING
  protected readonly slowText = SLOW_TEXT

  constructor() {
    const announcer = inject(LiveAnnouncer)
    let wasSlow = false
    effect(() => {
      const slow = this.phase() === 'slow'
      if (slow && !wasSlow) announcer.announce(`${SLOW_HEADING} ${SLOW_TEXT}`, 'polite').catch(console.error)
      wasSlow = slow
    })
  }
}
