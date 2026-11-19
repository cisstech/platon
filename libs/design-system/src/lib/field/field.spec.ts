import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Field, FieldInput, PasswordReveal } from './field'

@Component({
  imports: [Button, Field, FieldInput, Icon, PasswordReveal],
  template: `
    <pl-field label="Nom d'utilisateur">
      <input plInput autocomplete="username" [invalid]="invalid()" aria-describedby="message" />
    </pl-field>
    <pl-field label="Mot de passe">
      <a plFieldAside href="/docs">Mot de passe oublié&nbsp;?</a>
      <input plInput type="password" autocomplete="current-password" [invalid]="invalid()" />
      <button
        type="button"
        plButton
        variant="icon"
        size="sm"
        plPasswordReveal
        #reveal="plPasswordReveal"
        aria-label="Afficher le mot de passe"
      >
        <pl-icon [name]="reveal.shown() ? 'visibility_off' : 'visibility'" />
      </button>
    </pl-field>
    <p id="message">Nom d'utilisateur ou mot de passe incorrect.</p>
  `,
})
class Host {
  readonly invalid = signal(false)
}

describe('Field', () => {
  const render = () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const [user, password] = [...fixture.nativeElement.querySelectorAll('pl-field')] as HTMLElement[]
    return { fixture, user, password }
  }

  it('names its control by its label', () => {
    const { user } = render()
    const input = user.querySelector('input') as HTMLInputElement

    expect(input.id).toMatch(/^pl-input-\d+$/)
    expect(user.querySelector('label')?.getAttribute('for')).toBe(input.id)
    expect(user.querySelector('label')?.textContent?.trim()).toBe("Nom d'utilisateur")
  })

  it('keeps an aside, such as a link, beside its label', () => {
    const { password } = render()

    expect(password.querySelector('.pl-field__head a')?.textContent).toBe('Mot de passe oublié\u00a0?')
  })

  it('says its control is invalid, to the eye and to screen readers, and keeps the description it was given', () => {
    const { fixture, user } = render()
    fixture.componentInstance.invalid.set(true)
    fixture.detectChanges()

    const input = user.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('message')
    expect(user.hasAttribute('data-invalid')).toBe(true)
  })

  it('shows the password, then hides it again, the button saying which', () => {
    const { fixture, password } = render()
    const input = password.querySelector('input') as HTMLInputElement
    const reveal = password.querySelector('button') as HTMLButtonElement

    expect(input.type).toBe('password')
    expect(reveal.getAttribute('aria-pressed')).toBe('false')

    reveal.click()
    fixture.detectChanges()
    expect(input.type).toBe('text')
    expect(reveal.getAttribute('aria-pressed')).toBe('true')
    expect(reveal.querySelector('use')?.getAttribute('href')).toContain('#visibility_off')

    reveal.click()
    fixture.detectChanges()
    expect(input.type).toBe('password')
  })
})
