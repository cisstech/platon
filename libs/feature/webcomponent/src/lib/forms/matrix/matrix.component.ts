import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Injector, Input, Output } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { MatrixComponentDefinition, MatrixState } from './matrix'

@Component({
  selector: 'wc-matrix',
  templateUrl: 'matrix.component.html',
  styleUrls: ['matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(MatrixComponentDefinition)
export class MatrixComponent implements WebComponentHooks<MatrixState> {
  @Input() state!: MatrixState
  @Output() stateChange = new EventEmitter<MatrixState>()

  @HostBinding('style')
  get styles() {
    return {
      '--cols': this.state.cols,
      '--rows': this.state.rows,
    }
  }

  constructor(readonly injector: Injector) {}

  onChangeState() {
    const { cols, rows } = this.state
    if (!this.state.cells) {
      this.state.cells = []
    }
    const length = this.state.cells.length
    const maxLength = cols * rows
    if (length < maxLength) {
      for (let i = length; i < maxLength; i++) {
        this.state.cells.push({ value: '0' })
      }
    } else if (length > maxLength) {
      this.state.cells = this.state.cells.slice(0, maxLength)
    }
  }

  resize(dimension: { cols: number; rows: number }) {
    this.state.cols = dimension.cols
    this.state.rows = dimension.rows
  }

  trackBy(index: number) {
    return index
  }
}
