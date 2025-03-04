import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable, Subscription } from 'rxjs'
import { debounceTime, map, startWith } from 'rxjs/operators'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentService } from '../../web-component.service'
import { InputBoxComponentDefinition, InputBoxState } from './input-box'
import { WebComponentChangeDetectorService } from '../../web-component-change-detector.service'

@Component({
  selector: 'wc-input-box',
  templateUrl: 'input-box.component.html',
  styleUrls: ['input-box.component.scss'],
  host: {
    '[style.display]': `state.width === 'auto' || state.appearance === 'inline' ? 'inline-flex' : ''`,
    '[style.width]': `state.width !== 'auto' ? (state.width ? state.width : '100%') : ''`,
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(InputBoxComponentDefinition)
export class InputBoxComponent implements OnInit, OnDestroy, WebComponentHooks<InputBoxState> {
  private readonly webComponentService!: WebComponentService

  @Input() state!: InputBoxState
  @Output() stateChange = new EventEmitter<InputBoxState>()

  private subscription?: Subscription

  protected containerStyles: Record<string, string> = {}

  protected readonly form = new FormControl()
  private dueTime = 50

  protected specialCharactersGrid: string[][][] = []
  private hasToUpdateCharacters = true
  protected charactersPage = 0

  protected readonly $autocomplete: Observable<string[]> = this.form.valueChanges.pipe(
    startWith(''),
    map((value) => this.getSuggestions(value))
  )

  constructor(readonly injector: Injector, readonly changeDetector: WebComponentChangeDetectorService) {
    this.webComponentService = injector.get(WebComponentService)!
  }

  async ngOnInit() {
    this.state.isFilled = false

    this.subscription = this.form.valueChanges.pipe(debounceTime(this.dueTime)).subscribe(async (value) => {
      value = value || ''
      if (this.state.type === 'number') {
        value = ('' + value).replace(/,/g, '.')
        value = value === '-' ? '-' : Number.parseFloat(value) || 0
      }

      if (this.state.value !== value) {
        this.hasToUpdateCharacters = false

        await this.changeDetector.ignore(this, () => {
          this.state.isFilled = true
          this.state.value = value
        })
      }
    })
  }

  private initSpecialCharactersGrid() {
    let format = 0
    for (const i in this.state.specialCharacters) {
      if (this.state.specialCharacters[i] instanceof Array) {
        if (format === 1) {
          throw new Error('Special characters format is not correct (1)')
        }
        for (const j in this.state.specialCharacters[i]) {
          if (this.state.specialCharacters[i][j] instanceof Array) {
            if (format === 2) {
              throw new Error('Special characters format is not correct (2)')
            }
            format = 3
          } else {
            format = 2
          }
        }
      } else {
        format = 1
      }
    }
    if (format === 1) {
      this.specialCharactersGrid = [[this.state.specialCharacters as string[]]]
    } else if (format === 2) {
      this.specialCharactersGrid = [this.state.specialCharacters as string[][]]
    } else if (format === 3) {
      this.specialCharactersGrid = this.state.specialCharacters as string[][][]
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }

  @ViewChild('invisibleText') invTextER: ElementRef | undefined

  onChangeState() {
    this.state.isFilled = false
    this.form.setValue(this.state.value, {
      emitEvent: false,
    })
    this.form.enable({ emitEvent: false })
    if (this.state.disabled) {
      this.form.disable({ emitEvent: false })
    }

    if (this.state.width && this.state.width !== 'auto') {
      this.containerStyles['width'] = this.state.width
    }

    if (this.state.width && this.state.width === 'auto') {
      this.runAutoStyle()
    }

    if (this.state.specialCharacters && this.hasToUpdateCharacters) {
      this.initSpecialCharactersGrid()
    }

    if (!this.hasToUpdateCharacters) {
      this.hasToUpdateCharacters = true
    }
  }

  protected async autoValidate() {
    if (this.state.autoValidation) {
      await new Promise((resolve) => setTimeout(resolve, this.dueTime)) // wait for the last value change
      this.webComponentService.submit(this)
    }
  }

  private getSuggestions(value: string): string[] {
    if (!value) {
      return []
    }

    const convert = (v: string) => {
      return (v + '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    }

    value = convert(value)

    return this.state.completion.filter((option) => {
      return convert(option).includes(value)
    })
  }

  protected async insertSpecialCharacter(char: string) {
    await this.changeDetector.ignore(this, () => {
      this.form.setValue(this.form.value + char)
      this.state.isFilled = true
    })
  }

  protected hasSpecialCharacters(): boolean {
    for (const row of this.state.specialCharacters) {
      if (row.length) {
        return true
      }
    }
    return false
  }

  protected navigateSpecialCharacters(pageChange: number): void {
    this.charactersPage += pageChange
    if (this.charactersPage < 0) {
      this.charactersPage = this.specialCharactersGrid.length - 1
    } else if (this.charactersPage >= this.specialCharactersGrid.length) {
      this.charactersPage = 0
    }
  }

  private runAutoStyle(): void {
    if ((this.state.value as string).length === 0) {
      this.containerStyles['width'] = this.state.width
    } else {
      let minWidth = this.hasSpecialCharacters() ? 128 : 64
      if (this.state.completion) {
        //get the max length of completion tabs
        const maxLength = this.state.completion.reduce((max, s) => Math.max(max, s.length), 0)
        minWidth = Math.max(minWidth, maxLength * 16)
      }
      const width = this.hasSpecialCharacters()
        ? this.invTextER?.nativeElement.offsetWidth + minWidth
        : Math.max(this.invTextER?.nativeElement.offsetWidth + 16, minWidth)
      setTimeout(() => (this.containerStyles['width'] = width + 'px'), 0)
    }
  }
}
