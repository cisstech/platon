import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Alert } from './alert'

@Component({
  imports: [Alert],
  template: `
    <pl-alert role="status" icon="hourglass_empty" heading="Le chargement prend plus de temps que d'habitude.">
      <p>Nous réessayons, vous n'avez rien à faire.</p>
    </pl-alert>
  `,
})
class Host {}

@Component({
  imports: [Alert],
  template: `
    <pl-alert icon="construction" dismissLabel="Masquer l'annonce" (dismissed)="dismissed = dismissed + 1">
      <p>Maintenance dimanche 4 octobre, de 7 h à 9 h.</p>
    </pl-alert>
  `,
})
class DismissibleHost {
  dismissed = 0
}

describe('Alert', () => {
  it('shows its icon, its heading and its text, neutral by default', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const alert = fixture.nativeElement.querySelector('pl-alert') as HTMLElement
    expect(alert.dataset['tone']).toBe('neutral')
    expect(alert.querySelector('pl-icon')).not.toBeNull()
    expect(alert.querySelector('strong')?.textContent).toBe("Le chargement prend plus de temps que d'habitude.")
    expect(alert.textContent).toContain("Nous réessayons, vous n'avez rien à faire.")
  })

  it('closes on its button, named after what it closes, when it can be closed', () => {
    const fixture = TestBed.createComponent(DismissibleHost)
    fixture.detectChanges()
    const close = fixture.nativeElement.querySelector('pl-alert button') as HTMLButtonElement

    expect(close.getAttribute('aria-label')).toBe("Masquer l'annonce")
    close.click()
    expect(fixture.componentInstance.dismissed).toBe(1)
  })

  it('has no close button otherwise', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('pl-alert button')).toBeNull()
  })
})
