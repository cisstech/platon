import { LiveAnnouncer } from '@angular/cdk/a11y'
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { TestBed } from '@angular/core/testing'
import { Course } from '@platon/feature/course/common'
import { spoken } from '../../../../shared/testing/spoken'
import { CourseCreateDialog } from './course-create-dialog'

describe('CourseCreateDialog', () => {
  let close: jest.Mock
  let create: jest.Mock
  let announce: jest.Mock

  const render = () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DialogRef, useValue: { close } },
        { provide: DIALOG_DATA, useValue: { create } },
        { provide: LiveAnnouncer, useValue: { announce } },
      ],
    })
    const fixture = TestBed.createComponent(CourseCreateDialog)
    fixture.detectChanges()
    const element = fixture.nativeElement as HTMLElement
    document.body.appendChild(element)
    const [name, desc] = [element.querySelector('input'), element.querySelector('textarea')] as [
      HTMLInputElement,
      HTMLTextAreaElement
    ]
    const type = (field: HTMLInputElement | HTMLTextAreaElement, value: string) => {
      field.value = value
      field.dispatchEvent(new Event('input'))
      fixture.detectChanges()
    }
    const confirm = async () => {
      ;(
        [...element.querySelectorAll('button')].find((b) => spoken(b) === 'Créer le cours') as HTMLButtonElement
      ).click()
      await fixture.whenStable()
      fixture.detectChanges()
    }
    return { fixture, element, name, desc, type, confirm }
  }

  beforeEach(() => {
    close = jest.fn()
    announce = jest.fn(() => Promise.resolve())
    create = jest.fn((name: string) => Promise.resolve({ id: 'new', name } as Course))
  })

  afterEach(() => (document.body.innerHTML = ''))

  it('asks for the name of the course, as its students will see it, and its description', () => {
    const { element, name, desc } = render()

    expect(spoken(element.querySelector('h2'))).toBe('Créer un cours')
    expect(spoken(element.querySelector(`label[for="${name.id}"]`))).toBe('Nom du cours')
    expect(spoken(element.querySelector(`#${name.getAttribute('aria-describedby')}`))).toBe(
      'Tel que vos étudiants le verront.'
    )
    expect(spoken(element.querySelector(`label[for="${desc.id}"]`))).toBe('Description')
  })

  it('says and announces what is missing, the focus on the field that misses it once it says so', async () => {
    const { element, name, desc, type, confirm } = render()

    await confirm()
    expect(name.getAttribute('aria-invalid')).toBe('true')
    expect(spoken(element.querySelector(`#${name.getAttribute('aria-describedby')}`))).toBe('Donnez un nom au cours.')
    expect(document.activeElement).toBe(name)

    type(name, 'Algorithmique 2')
    await confirm()
    expect(desc.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(desc)
    expect(create).not.toHaveBeenCalled()
    expect(announce.mock.calls).toEqual([
      ['Donnez un nom au cours.', 'assertive'],
      ['Décrivez le cours en une ligne au moins.', 'assertive'],
    ])
  })

  it('creates the course and closes with it', async () => {
    const { name, desc, type, confirm } = render()
    type(name, ' Algorithmique 2 ')
    type(desc, 'L1, semestre 2.')

    await confirm()

    expect(create).toHaveBeenCalledWith('Algorithmique 2', 'L1, semestre 2.')
    expect(close).toHaveBeenCalledWith({ id: 'new', name: 'Algorithmique 2' })
  })

  it('stays open and says when the course could not be created', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    create.mockRejectedValue(new Error('502'))
    const { element, name, desc, type, confirm } = render()
    type(name, 'Algorithmique 2')
    type(desc, 'L1')

    await confirm()

    expect(close).not.toHaveBeenCalled()
    expect(spoken(element.querySelector('form > .course-create__error'))).toBe(
      "Le cours n'a pas pu être créé. Réessayez dans un instant."
    )
    expect(announce).toHaveBeenCalledWith("Le cours n'a pas pu être créé. Réessayez dans un instant.", 'assertive')
  })

  it('closes without a course when cancelled', () => {
    const { element } = render()

    ;([...element.querySelectorAll('button')].find((b) => spoken(b) === 'Annuler') as HTMLButtonElement).click()

    expect(close).toHaveBeenCalledWith()
  })
})
