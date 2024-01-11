import { CommonModule } from '@angular/common'
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
} from '@angular/core'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzStepsModule } from 'ng-zorro-antd/steps'
import { Subscription } from 'rxjs'
import { UiStepDirective } from './step.directive'

@Component({
  standalone: true,
  selector: 'ui-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzIconModule, NzStepsModule],
})
export class UiStepperComponent implements AfterContentInit, OnDestroy {
  private readonly suscriptions: Subscription[] = []

  protected items: UiStepDirective[] = []
  protected status: string[] = []
  protected activeStep?: UiStepDirective
  protected activeTemplate?: TemplateRef<unknown>

  @ContentChildren(UiStepDirective)
  protected steps!: QueryList<UiStepDirective>

  @Output() changed = new EventEmitter<number>()
  @Output() finished = new EventEmitter<void>()

  step = 0

  get isFirst(): boolean {
    return this.step === 0
  }

  get isLast(): boolean {
    return this.step === this.items.length - 1
  }

  get isValid(): boolean {
    return !!(this.activeStep?.stepValidator ?? true)
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngAfterContentInit() {
    this.step = 0
    this.status = []
    this.activeStep = undefined
    this.activeTemplate = undefined

    this.items = this.steps.toArray()
    this.changeStep()

    this.suscriptions.push(
      this.steps.changes.subscribe(() => {
        this.items = this.steps.toArray()
        this.changeStep()
      })
    )
  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((s) => s.unsubscribe())
  }

  nextStep(): void {
    if (this.step < this.items.length - 1) {
      this.step++
      this.changeStep()
    } else {
      this.finished.emit()
    }
  }

  prevStep(): void {
    if (this.step > 0) {
      this.step--
    }
    this.changeStep()
  }

  trackBy(_: number, item: UiStepDirective) {
    return item.stepTitle
  }

  private changeStep(): void {
    const size = this.items.length
    if (!size) return
    this.status = Array(size).fill('wait')
    for (let i = 0; i < size; i++) {
      this.status[i] = 'wait'
      if (i < this.step) {
        this.status[i] = 'finish'
      }
    }
    this.status[this.step] = 'process'
    this.activeStep = this.items[this.step]
    this.activeTemplate = this.items[this.step].templateRef
    this.changed.emit(this.step)
    this.changeDetectorRef.markForCheck()
  }
}
