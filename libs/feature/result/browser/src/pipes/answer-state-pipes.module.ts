import { NgModule } from '@angular/core'
import { AnswerStateColorPipe } from './answer-state-color.pipe'
import { AnswerStateIconPipe } from './answer-state-icon.pipe'
import { AnswerStateLabelPipe } from './answer-state-label.pipe'

@NgModule({
  exports: [AnswerStateColorPipe, AnswerStateIconPipe, AnswerStateLabelPipe],
  declarations: [AnswerStateColorPipe, AnswerStateIconPipe, AnswerStateLabelPipe],
})
export class AnswerStatePipesModule {}
