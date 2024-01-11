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

  constructor(readonly injector: Injector, readonly changeDetection: WebComponentChangeDetectorService) {}

  async ngOnInit() {
    this.mathfield = new MathfieldElement()
    this.mathfield.setOptions({
      locale: 'fr',
      smartFence: false,
      smartSuperscript: true,
      virtualKeyboards: 'all',
      virtualKeyboardMode: 'manual',
      virtualKeyboardTheme: 'material',
      fontsDirectory: 'assets/vendors/mathlive/fonts',
    })
    this.mathfield.oninput = () => {
      this.changeDetection.ignore(this, () => {
        this.state.value = this.mathfield.getValue('latex')
      })
    }
    this.container.nativeElement.replaceWith(this.mathfield)
  }

  onChangeState() {
    this.mathfield.disabled = this.state.disabled
    this.mathfield.setValue(this.state.value, {
      format: 'latex',
    })
    this.mathfield.setOptions(this.state.config || {})
  }
}
