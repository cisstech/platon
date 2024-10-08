import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { MathfieldElement } from 'mathlive'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentChangeDetectorService } from '../../web-component-change-detector.service'
import { MathLiveComponentDefinition, MathLiveState } from './math-live'

@Component({
  selector: 'wc-math-live',
  templateUrl: 'math-live.component.html',
  styleUrls: ['math-live.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(MathLiveComponentDefinition)
export class MathLiveComponent implements OnInit, WebComponentHooks<MathLiveState> {
  private mathfield!: MathfieldElement

  @Input() state!: MathLiveState
  @Output() stateChange = new EventEmitter<MathLiveState>()

  @ViewChild('container', { static: true })
  container!: ElementRef<HTMLElement>
  @ViewChild('box', { static: true })
  box!: ElementRef<HTMLElement>

  displayMenu = true

  constructor(readonly injector: Injector, readonly changeDetection: WebComponentChangeDetectorService) {}

  async ngOnInit() {
    this.mathfield = new MathfieldElement()
    this.mathfield.value = this.state.value
    this.mathfield.smartFence = false
    this.mathfield.smartSuperscript = true
    MathfieldElement.fontsDirectory = 'assets/vendors/mathlive/fonts'
    this.mathfield.oninput = () => {
      this.changeDetection
        .ignore(this, () => {
          this.state.value = this.mathfield.getValue('latex')
        })
        .catch(console.error)
    }
    this.container.nativeElement.replaceWith(this.mathfield)
  }

  onChangeState() {
    this.mathfield.disabled = this.state.disabled
    if (this.state.config) {
      Object.keys(this.state.config).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
        (this.mathfield as any)[key] = this.state.config[key]
      })
    }
    if (this.mathfield.menuItems?.length == 0) {
      this.box.nativeElement.classList.add('no-menu')
    } else {
      this.box.nativeElement.classList.remove('no-menu')
    }
    if (!this.state.layouts) {
      this.state.layouts = 'default'
    }
    this.mathfield.value = this.state.value
    window.mathVirtualKeyboard.layouts = this.state.layouts
  }
}
