import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { ClipboardService } from '@cisstech/nge/services'
import { DialogModule } from '@platon/core/browser'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

@Component({
  standalone: true,
  selector: 'wc-editor-css',
  templateUrl: './css.component.html',
  styleUrls: ['./css.component.scss'],
  imports: [CommonModule, NgeMarkdownModule, DialogModule, NzToolTipModule],
})
export class CssComponent {
  readonly appearances = [
    'success-state',
    'warning-state',
    'error-state',
    'success-border',
    'warning-border',
    'error-border',
  ]

  readonly animations = [
    'bounce',
    'flash',
    'pulse',
    'rubberBand',
    'shake',
    'headShake',
    'swing',
    'tada',
    'wobble',
    'jello',
    'jackInTheBox',
    'heartBeat',
    'bounceIn',
    'bounceInDown',
    'bounceInLeft',
    'bounceInRight',
    'bounceInUp',
    'bounceOut',
    'bounceOutDown',
    'bounceOutLeft',
    'bounceOutRight',
    'bounceOutUp',
    'fadeIn',
    'fadeInDown',
    'fadeInDownBig',
    'fadeInLeft',
    'fadeInLeftBig',
    'fadeInRight',
    'fadeInRightBig',
    'fadeInUp',
    'fadeInUpBig',
    'fadeOut',
    'fadeOutDown',
    'fadeOutDownBig',
    'fadeOutLeft',
    'fadeOutLeftBig',
    'fadeOutRight',
    'fadeOutRightBig',
    'fadeOutUp',
    'fadeOutUpBig',
    'flipInX',
    'flipInY',
    'flipOutX',
    'flipOutY',
    'lightSpeedIn',
    'lightSpeedOut',
    'rotateIn',
    'rotateInDownLeft',
    'rotateInDownRight',
    'rotateInUpLeft',
    'rotateInUpRight',
    'rotateOut',
    'rotateOutDownLeft',
    'rotateOutDownRight',
    'rotateOutUpLeft',
    'rotateOutUpRight',
    'hinge',
    'rollIn',
    'rollOut',
    'zoomIn',
    'zoomInDown',
    'zoomInLeft',
    'zoomInRight',
    'zoomInUp',
    'zoomOut',
    'zoomOutDown',
    'zoomOutLeft',
    'zoomOutRight',
    'zoomOutUp',
    'slideInDown',
    'slideInLeft',
    'slideInRight',
    'slideInUp',
    'slideOutDown',
    'slideOutLeft',
    'slideOutRight',
    'slideOutUp',
  ]

  activeAnimation = 'pulse'

  constructor(private readonly clipboard: ClipboardService) {}

  copyCss(appearance: string) {
    this.clipboard.copy(`${appearance} animate__animated animate__${this.activeAnimation} animate__infinite`)
  }

  trackByIndex(index: number) {
    return index
  }
}
