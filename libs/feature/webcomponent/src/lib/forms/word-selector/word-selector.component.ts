import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, OnInit } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentService } from '../../web-component.service'
import { WordSelectorComponentDefinition, WordSelectorState } from './word-selector'
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'

@Component({
  selector: 'wc-word-selector',
  templateUrl: 'word-selector.component.html',
  styleUrls: ['word-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(WordSelectorComponentDefinition)
export class WordSelectorComponent implements WebComponentHooks<WordSelectorState>, OnInit {
  /**
   * The state of the word selector component.
   */
  @Input() state!: WordSelectorState

  constructor(readonly injector: Injector) {}

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this.shuffleArray()
    this.state.isFilled = false
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer !== event.container || event.previousIndex !== event.currentIndex) {
      this.state.isFilled = true
    }
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex)
    }
  }

  suppremerUneLettre(phrase: string[], word: string) {
    const index = phrase.indexOf(word)
    if (index > -1) {
      phrase.splice(index, 1)
    }
  }

  addWord(word: string) {
    this.state.selectedWords.push(word)
    this.suppremerUneLettre(this.state.words, word)
  }

  removeWord(word: string) {
    this.state.words.push(word)
    this.suppremerUneLettre(this.state.selectedWords, word)
  }

  shuffleArray(): void {
    for (let i = this.state.words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.state.words[i], this.state.words[j]] = [this.state.words[j], this.state.words[i]]
    }
  }
}
