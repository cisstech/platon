import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Icon } from './icon'
import { ICON_NAMES } from './icon-names'
import { ICON_SPRITE_URL } from './icon-sprite'

describe('Icon', () => {
  let fixture: ComponentFixture<Icon>
  let host: HTMLElement

  beforeEach(() => {
    fixture = TestBed.createComponent(Icon)
    fixture.componentRef.setInput('name', 'school')
    host = fixture.nativeElement
  })

  it('points to its symbol in the versioned sprite', () => {
    fixture.detectChanges()
    expect(host.querySelector('use')?.getAttribute('href')).toBe(`${ICON_SPRITE_URL}#school`)
  })

  it('is hidden from assistive technologies without a label', () => {
    fixture.detectChanges()
    expect(host.getAttribute('aria-hidden')).toBe('true')
    expect(host.getAttribute('role')).toBeNull()
    expect(host.getAttribute('aria-label')).toBeNull()
  })

  it('is announced as an image when it has a label', () => {
    fixture.componentRef.setInput('label', 'Course')
    fixture.detectChanges()
    expect(host.getAttribute('role')).toBe('img')
    expect(host.getAttribute('aria-label')).toBe('Course')
    expect(host.getAttribute('aria-hidden')).toBeNull()
  })

  it('follows the text size without a size', () => {
    fixture.detectChanges()
    expect(host.style.getPropertyValue('--pl-icon-size')).toBe('')
  })

  it('takes its size from the icon size scale', () => {
    fixture.componentRef.setInput('size', 2)
    fixture.detectChanges()
    expect(host.style.getPropertyValue('--pl-icon-size')).toBe('var(--pl-icon-size-2)')
  })
})

describe('icon sprite', () => {
  const sprite = readFileSync(join(__dirname, '../../assets/icons.svg'), 'utf8')

  it('has exactly one symbol per listed name', () => {
    const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((match) => match[1])
    expect(ids).toEqual([...ICON_NAMES])
  })
})
