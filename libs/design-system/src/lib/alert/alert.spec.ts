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
})
