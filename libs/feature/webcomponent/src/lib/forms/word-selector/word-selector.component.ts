import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, OnInit } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentService } from '../../web-component.service'
import { WordSelectorComponentDefinition, WordSelectorState } from './word-selector'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CdkDragDrop, moveItemInArray, CdkDrag, CdkDropList, DropListOrientation } from '@angular/cdk/drag-drop'

@Component({
  selector: 'wc-word-selector',
  templateUrl: 'word-selector.component.html',
  styleUrls: ['word-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(WordSelectorComponentDefinition)
/**
 * Represents a component for selecting and arranging words.
 */
export class WordSelectorComponent implements WebComponentHooks<WordSelectorState>, OnInit {
  private readonly webComponentService!: WebComponentService

  @Input() state!: WordSelectorState
  stateChange?: EventEmitter<WordSelectorState> | undefined

  constructor(readonly injector: Injector) {
    this.webComponentService = injector.get(WebComponentService)!
  }

  ngOnInit() {
    this.state.words = ["C'", 'est', 'mon', 'ami', 'il', 'vient', "d'", 'Australie', 'et', 'il', 'est', 'très', 'sympa']
    this.state.words = [...this.state.words]
    this.shuffleArray()
  }

  drop(event: CdkDragDrop<string[]>) {
    const currentList = event.container.data
    const previousList = event.previousContainer.data

    if (currentList === previousList) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      const item = event.previousContainer.data[event.previousIndex]
      event.previousContainer.data.splice(event.previousIndex, 1)
      event.container.data.push(item)
    }
    this.stateChange?.emit(this.state)
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
    this.stateChange?.emit(this.state)
  }

  removeWord(word: string) {
    this.state.words.push(word)
    this.suppremerUneLettre(this.state.selectedWords, word)
    this.stateChange?.emit(this.state)
  }

  shuffleArray(): void {
    for (let i = this.state.words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.state.words[i], this.state.words[j]] = [this.state.words[j], this.state.words[i]]
    }
    this.stateChange?.emit(this.state)
  }
}
