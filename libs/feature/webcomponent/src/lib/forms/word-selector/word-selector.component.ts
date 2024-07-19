import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, OnInit } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentService } from '../../web-component.service'
import { WordSelectorComponentDefinition, WordSelectorState } from './word-selector'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'

@Component({
  selector: 'wc-word-selector',
  templateUrl: 'word-selector.component.html',
  styleUrls: ['word-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(WordSelectorComponentDefinition)
export class WordSelectorComponent implements WebComponentHooks<WordSelectorState>, OnInit {
  private readonly webComponentService!: WebComponentService

  @Input() state!: WordSelectorState
  stateChange?: EventEmitter<WordSelectorState> | undefined

  words: string[] = [
    "C'",
    'est',
    'mon',
    'ami',
    'il',
    'vient',
    "d'",
    'Australie',
    '.',
    "C'",
    'est',
    'tout',
    '.',
    'Australie',
    '.',
    "C'",
    'est',
    'tout',
  ]
  construireWords: string[] = []

  suffleWords: string[] = [] // On melange la liste affichée

  constructor(readonly injector: Injector) {
    this.webComponentService = injector.get(WebComponentService)!
  }

  ngOnInit() {
    this.suffleWords = [...this.words]
    this.shuffleArray()
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
      console.log('DANS LA MËME DIV')
    } else {
      const item = event.previousContainer.data[event.previousIndex]
      event.previousContainer.data.splice(event.previousIndex, 1)
      event.container.data.push(item)
    }
  }

  validateSentence() {
    if (this.listIdentique()) {
      console.log('Phrase validée :', this.construireWords.join(' '))
      return this.construireWords
    } else {
      this.construireWords
      console.log('Phrase invalide')
      return this.construireWords
    }
  }

  listIdentique(): boolean {
    if (this.construireWords.length !== this.words.length) {
      return false
    }
    for (let i = 0; i < this.construireWords.length; i++) {
      if (this.construireWords[i] !== this.words[i]) {
        return false
      }
    }
    return true
  }

  // ------------------------------------------------------- //
  suppremerUneLettre(phrase: string[], word: string) {
    const index = phrase.indexOf(word)
    if (index > -1) {
      phrase.splice(index, 1)
    }
  }

  addWord(word: string) {
    this.construireWords.push(word)
    this.suppremerUneLettre(this.suffleWords, word)
  }

  removeWord(word: string) {
    this.suffleWords.push(word)
    this.suppremerUneLettre(this.construireWords, word)
  }

  shuffleArray(): void {
    for (let i = this.suffleWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.suffleWords[i], this.suffleWords[j]] = [this.suffleWords[j], this.suffleWords[i]]
    }
  }
}
