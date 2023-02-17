import { CommonModule } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, EventEmitter, Output, QueryList, TemplateRef } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { UiStepDirective } from './step.directive';

@Component({
  standalone: true,
  selector: 'ui-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzIconModule,
    NzStepsModule
  ]
})
export class UiStepperComponent implements AfterContentInit {
  protected items: UiStepDirective[] = [];
  protected status: string[] = [];
  protected activeStep?: UiStepDirective;
  protected activeTemplate?: TemplateRef<unknown>;

  step = 0;

  @ContentChildren(UiStepDirective)
  protected steps!: QueryList<UiStepDirective>;

  @Output() changed = new EventEmitter<number>();
  @Output() finishd = new EventEmitter<void>();


  get isFirst(): boolean {
    return this.step === 0;
  }

  get isLast(): boolean {
    return this.step === this.items.length - 1;
  }

  get isValid(): boolean {
    return !!(this.activeStep?.stepValidator ?? true);
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  ngAfterContentInit(): void {
    this.step = 0;
    this.items = this.steps.toArray();
    this.items.forEach(() => this.status.push('wait'));
    if (this.status.length) {
      this.status[0] = 'process';
      this.activeStep = this.items[0];
      this.activeTemplate = this.items[0].templateRef;
    }
  }

  nextStep(): void {
    if (this.step < this.items.length - 1) {
      this.step++;
      this.changeStep();
    } else {
      this.finishd.emit();
    }
  }

  prevStep(): void {
    if (this.step > 0) {
      this.step--;
    }
    this.changeStep();
  }


  trackBy(_: number, item: UiStepDirective) {
    return item.stepTitle;
  }

  private changeStep(): void {
    for (let i = 0; i < this.status.length; i++) {
      this.status[i] = 'wait';
      if (i < this.step) {
        this.status[i] = 'finish';
      }
    }
    this.status[this.step] = 'process';
    this.activeStep = this.items[this.step];
    this.activeTemplate = this.items[this.step].templateRef;
    this.changed.emit(this.step);
    this.changeDetectorRef.markForCheck();
  }
}
