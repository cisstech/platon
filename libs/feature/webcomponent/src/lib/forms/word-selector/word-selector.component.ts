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
export class WordSelectorComponent implements WebComponentHooks<WordSelectorState>, OnInit {
  private readonly webComponentService!: WebComponentService

  @Input() state!: WordSelectorState
  stateChange?: EventEmitter<WordSelectorState> | undefined

  //words: string[] = ["C'", 'est', 'mon', 'ami', 'il', 'vient', "d'", 'Australie', '.']
  words: string[] = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

  construireWords: string[] = []

  suffleWords: string[] = [] // On melange la liste affichée

  constructor(readonly injector: Injector) {
    this.webComponentService = injector.get(WebComponentService)!
  }

  ngOnInit() {
    this.suffleWords = [...this.words]
    //this.shuffleArray()
  }

  getRows() {
    const rows = []
    for (let i = 0; i < this.suffleWords.length; i += 4) {
      rows.push(this.suffleWords.slice(i, i + 4))
    }
    return rows
  }

  drop(event: CdkDragDrop<string[]>) {
    const currentList = event.container.data
    const previousList = event.previousContainer.data

    if (currentList === previousList) {
      // Déplacement à l'intérieur de la même sous-liste
      console.log('first: ' + event.previousIndex + ' ' + previousList[event.previousIndex])
      console.log('second: ' + event.currentIndex + ' ' + currentList[event.currentIndex])

      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      const item = event.previousContainer.data[event.previousIndex]
      event.previousContainer.data.splice(event.previousIndex, 1)
      event.container.data.push(item)
    }
    console.log('List:', event.container.data)
  }

  // drop(event: CdkDragDrop<string[]>) {
  //   const currentList = event.container.data
  //   const previousList = event.previousContainer.data

  //   if (currentList === previousList) {
  //     // Moving within the same list
  //     const itemIndex = event.previousIndex
  //     const targetIndex = event.currentIndex
  //     const item = currentList.splice(itemIndex, 1)[0]
  //     currentList.splice(targetIndex, 0, item)

  //     // Update the other list
  //     const otherList = currentList === this.suffleWords ? this.construireWords : this.suffleWords
  //     otherList.splice(otherList.indexOf(item), 1)
  //   } else {
  //     const item = event.previousContainer.data[event.previousIndex]
  //     event.previousContainer.data.splice(event.previousIndex, 1)
  //     event.container.data.push(item)
  //   }

  //   // Ensure lists are synchronized
  //   this.suffleWords.sort((a, b) => this.construireWords.indexOf(a) - this.construireWords.indexOf(b))
  // }

  // drop(event: CdkDragDrop<string[]>) {
  //   const currentList = event.container.data
  //   const previousIndex = event.previousIndex
  //   const currentIndex = event.currentIndex

  //   if (currentList === event.previousContainer.data) {
  //     // Swap elements within the same list
  //     const [removed] = currentList.splice(previousIndex, 1)
  //     currentList.splice(currentIndex, 0, removed)
  //   } else {
  //     // Move element between lists (handled by moveItemInArray)
  //     moveItemInArray(currentList, previousIndex, currentIndex)
  //   }
  // }

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
