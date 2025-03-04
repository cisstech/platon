import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { BindedBubblesComponentDefinition, BindedBubblesState, BubbleItem, PairBubbleItem } from './binded-bubbles'
import { WebComponentService } from '../../web-component.service'

@Component({
  selector: 'wc-binded-bubbles',
  templateUrl: 'binded-bubbles.component.html',
  styleUrls: ['binded-bubbles.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
@WebComponent(BindedBubblesComponentDefinition)
export class BindedBubblesComponent implements WebComponentHooks<BindedBubblesState>, OnInit {
  @Input() state!: BindedBubblesState
  @Output() stateChange = new EventEmitter<BindedBubblesState>()

  webComponentService: WebComponentService

  numberPairToShow = 3
  shuffledList: BubbleItem[] = []
  list1: BubbleItem[] = []
  list2: BubbleItem[] = []
  waitingChoice: { index1: number; index2: number; pair: PairBubbleItem }[] = []
  clickedList: BubbleItem[] = []
  achieveList: PairBubbleItem[] = []
  timeoutID: NodeJS.Timeout | undefined

  constructor(readonly injector: Injector) {
    this.webComponentService = injector.get(WebComponentService)!
  }

  ngOnInit() {
    let cmp = 0
    this.numberPairToShow = this.state.numberPairToShow
    this.state.items.forEach((element) => {
      element.item1.id = cmp++ + ''
      element.item1.state = 'unchecked'
      element.item2.id = cmp++ + ''
      element.item2.state = 'unchecked'
    })
    this.state.isFilled = false
    this.constructShuffleList()
  }

  onChangeState(): void {
    if (!Array.isArray(this.state.items)) {
      this.state.items = []
    }
    if (this.state.numberPairToShow != this.numberPairToShow) {
      this.numberPairToShow = this.state.numberPairToShow
      this.shuffledList = []
      this.list1 = []
      this.list2 = []
      this.waitingChoice = []
      this.clickedList = []
      this.constructShuffleList()
    }
  }

  updateClickedList(item: BubbleItem) {
    if (item.state === 'unchecked') {
      item.state = 'checked'
      this.clickedList.push(item)
    } else if (item.state === 'checked') {
      this.clickedList.find((element) => element.id === item.id)!.state = 'unchecked'
      this.clickedList = this.clickedList.filter((element) => element.id !== item.id)
    }
    if (this.clickedList.length > 2) {
      const item = this.clickedList.shift()
      if (item !== undefined) {
        item.state = 'unchecked'
      }
    }
    this.achievePair()
  }

  achievePair() {
    if (this.clickedList.length === 2) {
      const pair = this.generatePair(this.clickedList[0], this.clickedList[1])
      const reversedPair = this.generatePair(this.clickedList[1], this.clickedList[0])

      let foundPair: PairBubbleItem | undefined = undefined
      let sameSide = true
      for (const item of this.state.items) {
        if (item.item1.id === pair.item1.id || reversedPair.item1.id === item.item1.id) {
          sameSide = !sameSide
        }
        if (
          (item.item1.id === pair.item1.id && item.item2.id === pair.item2.id) ||
          (item.item1.id === reversedPair.item1.id && item.item2.id === reversedPair.item2.id)
        ) {
          foundPair = item
          break
        }
      }

      if (foundPair) {
        this.clearClickedList(false)
        this.handleAchievedPair(foundPair)
        this.autoValidate()
      } else {
        if (!sameSide) {
          this.state.nbError++
          this.state.errors.push(pair)
          this.clearClickedList(true)
        } else {
          const item = this.clickedList.shift()
          if (item !== undefined) {
            item.state = 'unchecked'
          }
        }
      }
      //mettre à jour les deux list
      this.list1 = this.list1.slice()
      this.list2 = this.list2.slice()
    }
  }

  private generatePair(item1: BubbleItem, item2: BubbleItem): PairBubbleItem {
    return {
      item1: { ...item1 },
      item2: { ...item2 },
    }
  }

  private handleAchievedPair(pair: PairBubbleItem) {
    this.achieveList.push(pair)
    this.state.items.forEach((item) => {
      if (item.item1.id === pair.item1.id && item.item2.id === pair.item2.id) {
        item.item1.state = 'achieved'
        item.item2.state = 'achieved'
      }
    })

    switch (this.state.mode) {
      case 'shuffle':
        break
      case 'ordered':
        this.handleOrderedAchievedPair(pair)
        break
    }
  }

  private handleOrderedAchievedPair(pair: PairBubbleItem) {
    const index1 = this.list1.findIndex((item) => item.id === pair.item1.id)
    const index2 = this.list2.findIndex((item) => item.id === pair.item2.id)
    this.list1[index1].state = 'achieved'
    this.list2[index2].state = 'achieved'
    const concatList = this.list1.concat(this.list2)
    let randomItem: PairBubbleItem | undefined
    do {
      randomItem = this.getRandomPairThatIsNotInTheList(concatList)
      //while randomItem is in waitingChoice
    } while (this.waitingChoice.find((elem) => elem.pair.item1.id === randomItem?.item1.id) !== undefined)

    if (randomItem == undefined) {
      this.list1[index1].state = 'disabled'
      this.list2[index2].state = 'disabled'
      return
    }

    this.waitingChoice.push({ index1: index1, index2: index2, pair: randomItem })

    if (this.waitingChoice.length >= 2) {
      clearTimeout(this.timeoutID)
      this.fillOrdered()
      this.timeoutID = undefined
    } else {
      this.timeoutID = setTimeout(() => {
        this.timeoutID = undefined
        this.fillOrdered()
      }, this.state.timeout) // If you reach this timeout, place a good pair at the same index
    }
  }

  getRandomPairThatIsNotInTheList(list: BubbleItem[]): PairBubbleItem | undefined {
    let count = 0
    this.state.items.forEach((element) => {
      if (element.item1.state !== 'achieved' && element.item2.state !== 'achieved') {
        count++
      }
    })
    if (count < this.numberPairToShow) {
      return undefined
    }
    let randomIndex = Math.floor(Math.random() * this.state.items.length)
    let randomPair = this.state.items[randomIndex]
    while (this.foundPair(list, randomPair)) {
      randomIndex = Math.floor(Math.random() * this.state.items.length)
      randomPair = this.state.items[randomIndex]
    }
    return randomPair
  }

  constructShuffleList() {
    const cuttedList = this.state.items.slice(0, this.numberPairToShow)
    cuttedList.forEach((element) => {
      this.shuffledList.push(element.item1)
      this.shuffledList.push(element.item2)
    })
    this.shuffleByMode()
  }

  shuffleByMode() {
    if (this.state.mode === 'ordered') {
      this.splitListAndShuffle(this.shuffledList)
    } else {
      this.shuffledList = this.shuffle(this.shuffledList)
    }
  }

  shuffle(array: BubbleItem[]): BubbleItem[] {
    //shuffle an array
    let currentIndex = array.length,
      randomIndex
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
      ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
  }

  splitListAndShuffle(array: BubbleItem[]): void {
    this.list1 = array.filter((_, index) => index % 2 === 0)
    this.list2 = array.filter((_, index) => index % 2 !== 0)
    this.list1 = this.shuffle(this.list1)
    this.list2 = this.shuffle(this.list2)
  }

  foundPair(tab: BubbleItem[], pair: PairBubbleItem): BubbleItem | undefined {
    if (pair.item1.state === 'achieved' || pair.item2.state === 'achieved') return pair.item1
    return tab.find((element) => element.id === pair.item1.id || element.id === pair.item2.id)
  }

  onAnimationEnd(item: BubbleItem) {
    if (item.state === 'error') {
      item.state = 'unchecked'
    }
  }

  clearClickedList(gotWrong: boolean) {
    if (gotWrong) this.clickedList.forEach((element) => (element.state = 'error'))
    else this.clickedList.forEach((element) => (element.state = 'achieved'))
    this.clickedList = []
  }

  shuffleChoice() {
    const copiedWaitingChoice = JSON.parse(JSON.stringify(this.waitingChoice)) as {
      index1: number
      index2: number
      pair: PairBubbleItem
    }[]
    let listOfItem2 = copiedWaitingChoice.map((elem) => elem.pair.item2)
    listOfItem2 = this.shuffle(listOfItem2)
    copiedWaitingChoice.forEach((elem, index) => {
      elem.pair.item2 = listOfItem2[index]
    })
    this.waitingChoice = copiedWaitingChoice
  }

  fillOrdered(): void {
    this.shuffleChoice()
    const length = this.waitingChoice.length
    for (let i = 0; i < length; i++) {
      const pairToAdd = this.waitingChoice.pop()!
      this.list1[pairToAdd.index1] = pairToAdd.pair.item1
      this.list2[pairToAdd.index2] = pairToAdd.pair.item2
    }
  }

  protected autoValidate() {
    if (this.achieveList.length === this.state.items.length) {
      this.webComponentService.submit(this)
    }
  }
}
