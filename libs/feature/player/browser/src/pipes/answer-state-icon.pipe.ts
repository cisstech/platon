import { Pipe, PipeTransform } from '@angular/core';
import { AnswerStateIcons, AnswerStates } from '@platon/feature/player/common';

@Pipe({
  name: 'answerStateIcon'
})
export class AnswerStateIconPipe implements PipeTransform {
  transform(value: AnswerStates): string {
    return AnswerStateIcons[value]
  }
}
