import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Icon } from '../icon/icon'
import { Button } from './button'

@Component({
  imports: [Button, Icon],
  template: `
    <button plButton variant="primary" size="lg" tone="danger" [loading]="loading()" (click)="clicks = clicks + 1">
      Supprimer le cours
    </button>
  `,
})
class Host {
  readonly loading = signal(false)
  clicks = 0
}

@Component({
  imports: [Button, Icon],
  template: `<button plButton variant="icon"><pl-icon name="close" /></button>`,
})
class UnnamedIcon {}

describe('Button', () => {
  let fixture: ComponentFixture<Host>
  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement

  beforeEach(() => {
    fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
  })

  it('exposes its variant, size and tone to its styles', () => {
    expect(button().dataset).toMatchObject({ variant: 'primary', size: 'lg', tone: 'danger' })
  })

  it('keeps its label while it works, announces it and ignores clicks', () => {
    fixture.componentInstance.loading.set(true)
    fixture.detectChanges()
    expect(button().textContent).toContain('Supprimer le cours')
    expect(button().getAttribute('aria-busy')).toBe('true')
    expect(button().querySelector('.pl-button__spinner')).not.toBeNull()
    button().click()
    expect(fixture.componentInstance.clicks).toBe(0)

    fixture.componentInstance.loading.set(false)
    fixture.detectChanges()
    button().click()
    expect(fixture.componentInstance.clicks).toBe(1)
    expect(button().hasAttribute('aria-busy')).toBe(false)
  })

  it('reports an icon button without a name', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const unnamed = TestBed.createComponent(UnnamedIcon)
    unnamed.detectChanges()
    await unnamed.whenStable()
    expect(error).toHaveBeenCalledWith(expect.stringContaining('needs a name'), expect.anything())
    error.mockRestore()
  })
})
