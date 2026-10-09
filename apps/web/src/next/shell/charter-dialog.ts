import { DialogRef } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { Dialog } from '@platon/design-system'

export const CHARTER_HEADING_ID = 'app-charter-title'

/** The licence of the resources, accepted once before creating anything. Closes with `true` when accepted. */
@Component({
  selector: 'app-charter-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog],
  template: `
    <pl-dialog
      heading="Vos ressources seront partagées"
      [headingId]="headingId"
      confirmLabel="Accepter"
      cancelLabel="Refuser"
      (confirmed)="dialogRef.close(true)"
      (cancelled)="dialogRef.close(false)"
    >
      <p>
        PLaTon encourage le partage : les ressources créées ici sont publiées sous la licence Creative Commons
        Attribution, partage dans les mêmes conditions (CC BY-SA 2.0).
      </p>
      <p>Tout le monde peut donc les copier, les diffuser, les modifier et s'en servir pour en créer d'autres :</p>
      <ul>
        <li>à condition de citer qui les a écrites ;</li>
        <li>et de partager ce qui en est tiré sous la même licence.</li>
      </ul>
      <p>
        <a href="https://creativecommons.org/licenses/by-sa/2.0/deed.fr" target="_blank" rel="noopener">
          Lire la licence CC BY-SA 2.0<span class="pl-visually-hidden">, s'ouvre dans un nouvel onglet</span>
        </a>
      </p>
    </pl-dialog>
  `,
})
export class CharterDialog {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef)
  protected readonly headingId = CHARTER_HEADING_ID
}
