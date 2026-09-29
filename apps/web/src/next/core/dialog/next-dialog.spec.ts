import { LiveAnnouncer } from '@angular/cdk/a11y'
import { Component, TemplateRef, viewChild } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { DialogService, NotificationContext } from '@platon/core/browser/shared'
import { DEFAULT_TOAST_DURATION, Toaster } from '@platon/design-system'
import { NextDialog } from './next-dialog'

@Component({
  template: `<ng-template #error let-data="data">
    <pre>{{ data.message }}</pre>
  </ng-template>`,
})
class Host {
  readonly error = viewChild.required<TemplateRef<NotificationContext>>('error')
}

describe('NextDialog', () => {
  let dialog: DialogService
  let toaster: Toaster

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DialogService, useClass: NextDialog },
        { provide: LiveAnnouncer, useValue: { announce: jest.fn().mockResolvedValue(undefined) } },
      ],
    })
    dialog = TestBed.inject(DialogService)
    toaster = TestBed.inject(Toaster)
  })

  afterEach(() => {
    document.querySelector('pl-toast-stack')?.remove()
    document.querySelector('.cdk-overlay-container')?.remove()
  })

  const toasts = () => toaster.toasts().map(({ options }) => options)
  const render = () => TestBed.tick()
  const overlay = () => document.querySelector('.cdk-overlay-container') as HTMLElement
  const button = (label: string) =>
    [...overlay().querySelectorAll('button')].find(
      (candidate) => candidate.textContent?.trim() === label
    ) as HTMLButtonElement

  describe('messages', () => {
    const tones = [
      ['success', 'success'],
      ['error', 'danger'],
      ['info', 'info'],
      ['warning', 'warning'],
    ] as const
    for (const [method, tone] of tones) {
      it(`${method} shows a ${tone} toast with a close button`, () => {
        dialog[method]('Exercice enregistré')
        expect(toasts()).toEqual([
          {
            tone,
            title: undefined,
            message: 'Exercice enregistré',
            duration: DEFAULT_TOAST_DURATION,
            dismissLabel: 'Fermer',
          },
        ])
      })
    }

    it('takes a title and a duration, and closes through the returned function', () => {
      const close = dialog.error('Le serveur ne répond pas', { duration: 0, notification: { title: 'Erreur' } })
      expect(toasts()[0]).toMatchObject({ title: 'Erreur', duration: 0 })
      close()
      expect(toasts()).toEqual([])
    })
  })

  it('notification renders the template with its data', () => {
    const host = TestBed.createComponent(Host)
    host.detectChanges()
    const close = dialog.notification(host.componentInstance.error(), {
      data: { message: 'Erreur de syntaxe ligne 3' },
    })
    render()
    expect(document.querySelector('pl-toast pre')?.textContent).toBe('Erreur de syntaxe ligne 3')
    close()
    expect(toasts()).toEqual([])
  })

  it('loading shows a toast while the work runs, even when it fails', async () => {
    let during: unknown[] = []
    await dialog.loading('Import des notes', async () => {
      during = toasts()
    })
    expect(during).toEqual([{ tone: 'loading', message: 'Import des notes', duration: 0 }])
    await expect(
      dialog.loading('Import des notes', async () => {
        throw new Error('refused')
      })
    ).rejects.toThrow('refused')
    expect(toasts()).toEqual([])
  })

  describe('confirm', () => {
    const open = () => {
      const answer = dialog.confirm({
        nzTitle: 'Régénérer le code',
        nzContent: "L'ancien code ne fonctionnera plus.<br/>Continuer ?",
        nzOkText: 'Oui',
        nzCancelText: 'Non',
      })
      render()
      return answer
    }

    it('shows the question, labelled by its title, with the legacy nz keys', async () => {
      const answer = open()
      const container = overlay().querySelector('[role="dialog"]') as HTMLElement
      const title = container.querySelector('h2') as HTMLElement
      expect(title.textContent).toBe('Régénérer le code')
      expect(container.getAttribute('aria-labelledby')).toBe(title.id)
      expect(container.querySelector('pl-dialog div div')?.innerHTML).toBe(
        "L'ancien code ne fonctionnera plus.<br>Continuer ?"
      )
      button('Non').click()
      await answer
    })

    it('resolves true on OK', async () => {
      const answer = open()
      button('Oui').click()
      expect(await answer).toBe(true)
    })

    it('resolves false on Cancel', async () => {
      const answer = open()
      button('Non').click()
      expect(await answer).toBe(false)
    })

    it('resolves false on Escape', async () => {
      const answer = open()
      const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      Object.defineProperty(escape, 'keyCode', { get: () => 27 })
      document.body.dispatchEvent(escape)
      expect(await answer).toBe(false)
    })

    it('uses French labels and marks a destructive action', async () => {
      const answer = dialog.confirm({ title: 'Supprimer le cours ?', danger: true })
      render()
      expect(button('Confirmer')).toBeTruthy()
      expect(overlay().querySelector('pl-dialog')?.getAttribute('data-tone')).toBe('danger')
      button('Annuler').click()
      expect(await answer).toBe(false)
    })
  })

  describe('prompt', () => {
    const open = () => {
      const answer = dialog.prompt({ title: 'Renommer le dossier', label: 'Nom', value: 'Chapitre 1' })
      render()
      return answer
    }
    const input = () => overlay().querySelector('input') as HTMLInputElement
    const type = (value: string) => {
      input().value = value
      input().dispatchEvent(new Event('input'))
      render()
    }

    it('resolves the entered value', async () => {
      const answer = open()
      expect(input().value).toBe('Chapitre 1')
      expect(overlay().querySelector('label')?.getAttribute('for')).toBe(input().id)
      type('Chapitre 2')
      button('OK').click()
      expect(await answer).toBe('Chapitre 2')
    })

    it('resolves nothing when cancelled', async () => {
      const answer = open()
      button('Annuler').click()
      expect(await answer).toBeUndefined()
    })

    it('cannot confirm an empty value', async () => {
      const answer = open()
      type('')
      expect(button('OK').disabled).toBe(true)
      button('Annuler').click()
      await answer
    })
  })
})
