import { TestBed } from '@angular/core/testing'
import { Avatar, initialsOf } from './avatar'

describe('initialsOf', () => {
  it.each([
    [{ firstName: 'Inès', lastName: 'Benali' }, 'IB'],
    [{ firstName: 'élodie', lastName: 'ó Briain' }, 'ÉÓ'],
    [{ firstName: 'Karim', lastName: null }, 'K'],
    [{ firstName: '  ', lastName: 'Haddad', username: 'khaddad' }, 'H'],
    [{ username: 'mcisse' }, 'MC'],
    [{}, '?'],
  ])('%j gives %s', (person, expected) => {
    expect(initialsOf(person)).toBe(expected)
  })
})

describe('Avatar', () => {
  it('is decorative next to a name, and an image when it has a label', () => {
    const fixture = TestBed.createComponent(Avatar)
    fixture.componentRef.setInput('person', { firstName: 'Inès', lastName: 'Benali' })
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    expect(host.textContent).toBe('IB')
    expect(host.getAttribute('aria-hidden')).toBe('true')

    fixture.componentRef.setInput('label', 'Inès Benali')
    fixture.detectChanges()
    expect(host.getAttribute('role')).toBe('img')
    expect(host.getAttribute('aria-label')).toBe('Inès Benali')
    expect(host.hasAttribute('aria-hidden')).toBe(false)
  })
})
