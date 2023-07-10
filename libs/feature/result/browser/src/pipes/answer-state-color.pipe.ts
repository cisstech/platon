import { Pipe, PipeTransform } from '@angular/core'
import { AnswerStateColors, AnswerStates } from '@platon/feature/result/common'

@Pipe({
  name: 'answerStateColor',
})
export class AnswerStateColorPipe implements PipeTransform {
  transform(value: AnswerStates): string {
    return AnswerStateColors[value]
  }
}
