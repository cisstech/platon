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
 * Represents a component for selecting words.
 */
export class WordSelectorComponent implements WebComponentHooks<WordSelectorState>, OnInit {
  /**
   * The web component service.
   */
  private readonly webComponentService!: WebComponentService

  /**
   * The state of the word selector component.
   */
  @Input() state!: WordSelectorState

  /**
   * Event emitter for state changes.
   */
  stateChange?: EventEmitter<WordSelectorState> | undefined

  /**
   * The list of words.
   */
  words: string[] = ["C'", 'est', 'mon', 'ami', 'il', 'vient', "d'", 'Australie', 'et', 'il', 'est', 'très', 'sympa']

  /**
   * The constructed words.
   */
  construireWords: string[] = []

  /**
   * The shuffled words.
   */
  suffleWords: string[] = []

  /**
   * Constructs a new instance of WordSelectorComponent.
   * @param injector - The injector for dependency injection.
   */
  constructor(readonly injector: Injector) {
    this.webComponentService = injector.get(WebComponentService)!
  }

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this.suffleWords = [...this.words]
    this.shuffleArray()
  }

  /**
   * Handles the drop event for the word-selector component.
   * @param event - The CdkDragDrop event containing information about the drop.
   */
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
    console.log('List:', event.container.data)
  }

  /**
   * Validates the constructed sentence.
   * @returns The constructed words if the sentence is valid, otherwise an empty array.
   */
  validateSentence() {
    if (this.listIdentique()) {
      return this.construireWords
    }
    return this.construireWords
  }

  /**
   * Checks if the constructed words are identical to the original words.
   * @returns True if the words are identical, false otherwise.
   */
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

  /**
   * Removes a letter from the given phrase.
   * @param phrase - The phrase to remove the letter from.
   * @param word - The word to remove.
   */
  suppremerUneLettre(phrase: string[], word: string) {
    const index = phrase.indexOf(word)
    if (index > -1) {
      phrase.splice(index, 1)
    }
  }

  /**
   * Adds a word to the constructed words.
   * @param word - The word to add.
   */
  addWord(word: string) {
    this.construireWords.push(word)
    this.suppremerUneLettre(this.suffleWords, word)
  }

  /**
   * Removes a word from the constructed words.
   * @param word - The word to remove.
   */
  removeWord(word: string) {
    this.suffleWords.push(word)
    this.suppremerUneLettre(this.construireWords, word)
  }

  /**
   * Shuffles the array of words.
   */
  shuffleArray(): void {
    for (let i = this.suffleWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.suffleWords[i], this.suffleWords[j]] = [this.suffleWords[j], this.suffleWords[i]]
    }
  }
}
