import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core';
import { WebComponent, WebComponentHooks } from '../../web-component';
import { BindedBubblesComponentDefinition, BindedBubblesState, BubbleItem, PairBubbleItem } from './binded-bubbles';


@Component({
  selector: 'wc-binded-bubbles',
  templateUrl: 'binded-bubbles.component.html',
  styleUrls: ['binded-bubbles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(BindedBubblesComponentDefinition)
export class BindedBubblesComponent implements WebComponentHooks<BindedBubblesState> {
  @Input() state!: BindedBubblesState;
  shuffledList : BubbleItem[] = [];
  list1 : BubbleItem[] = [];
  list2 : BubbleItem[] = [];
  waitingChoice : {index1 : number, index2 : number, pair : PairBubbleItem}[] = [];
  clickedList : BubbleItem[] = [];
  achieveList : PairBubbleItem[] = [];
  timeoutID : NodeJS.Timeout | undefined;


  constructor(readonly injector: Injector) {}

  ngOnInit() {
    this.state.items.map((element) => {
      element.item1.state = 'unchecked';
      element.item2.state = 'unchecked';
    }
    );
    this.constructShuffleList();
  }


  updateClickedList(item: BubbleItem) {
    if (item.state === 'unchecked') { // Si on a cliqué sur un item pas state
      item.state = 'checked';
      this.clickedList.push(item);
    }
    else if (item.state === 'checked') { // Si on a cliqué sur un item state
      let e = this.clickedList.find(element => element.id === item.id)!.state = 'unchecked';
      this.clickedList = this.clickedList.filter(element => element.id !== item.id);
    }
    if (this.clickedList.length > 2) {
      const item = this.clickedList.shift();
      if (item !== undefined) {
        item.state = 'unchecked';
      }
    }
    this.achievePair();
  }

  achievePair() {
    if (this.clickedList.length === 2) {
      const pair = this.generatePair(this.clickedList[0], this.clickedList[1]);
      const reversedPair = this.generatePair(this.clickedList[1], this.clickedList[0]);

      const foundPair = this.state.items.find(item =>
        (item.item1.id === pair.item1.id && item.item2.id === pair.item2.id) ||
        (item.item1.id === reversedPair.item1.id && item.item2.id === reversedPair.item2.id)
      );

      if (foundPair) {
        this.handleAchievedPair(foundPair);
        this.clearClickedList(false);
      }
      else {
        this.clearClickedList(true);
      }
    }
  }


  private generatePair(item1: BubbleItem, item2: BubbleItem): PairBubbleItem {
    return {
      item1: { ...item1 },
      item2: { ...item2 }
    };
  }

  private handleAchievedPair(pair: PairBubbleItem) {
    this.achieveList.push(pair);

    //remove the pair from the items
    this.state.items = this.state.items.filter(item =>
      item.item1.id !== pair.item1.id && item.item2.id !== pair.item2.id
    );

    switch (this.state.mode) {
      case 'shuffle':
        break;
      case 'ordered':
          this.handleOrderedAchievedPair(pair);
        break;
    }
  }

  private handleOrderedAchievedPair(pair: PairBubbleItem) {
    // find indexes of the pair in list1 and list2
    const index1 = this.list1.findIndex(item => item.id === pair.item1.id);
    const index2 = this.list2.findIndex(item => item.id === pair.item2.id);
    const concatList = this.list1.concat(this.list2);

    let randomItem = this.getRandomPairThatIsNotInTheList(concatList);
    if (randomItem == undefined) {
      this.list1[index1].state = 'disabled'
      this.list2[index2].state = 'disabled'
      return;
    }
    this.waitingChoice.push({index1: index1, index2: index2, pair:randomItem});


    if (this.shuffleChoice.length >= 2) {
      clearTimeout(this.timeoutID);
      this.fillOrdered();
    }
    else {
      this.timeoutID = setTimeout( () => {
        this.fillOrdered();
        this.timeoutID = undefined;
      }, 700); // If you reach this timeout, place a good pair at the same index
    }
  }

  getRandomPairThatIsNotInTheList(list: BubbleItem[]) : PairBubbleItem | undefined {
    if (this.state.items.length <= this.state.numberPairToShow) {
      return undefined;
    }
    let randomIndex = Math.floor(Math.random() * this.state.items.length);
    let randomPair = this.state.items[randomIndex];
    while (this.foundPair(list, randomPair)) {
      randomIndex = Math.floor(Math.random() * this.state.items.length);
      randomPair = this.state.items[randomIndex];
    }
    return randomPair;
  }


  constructShuffleList() {
    //construct a random list of items based on this.state.item size of this.state.numberPairToShow
    let cuttedList = this.state.items.slice(0, this.state.numberPairToShow);
    cuttedList.forEach(element => {
      this.shuffledList.push(element.item1);
      this.shuffledList.push(element.item2);
    });
    this.shuffleByMode();
  }

  shuffleByMode() {
    if (this.state.mode === 'ordered') {
      this.splitListAndShuffle(this.shuffledList);
    }
    else {
      this.shuffledList = this.shuffle(this.shuffledList);
    }
  }


  shuffle(array: BubbleItem[]): BubbleItem[] {
      //shuffle an array
      let currentIndex = array.length, randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
      return array;
  }

  splitListAndShuffle(array :BubbleItem []) : void {
    this.list1 = array.filter((_, index) => index % 2 === 0); // Extraire les éléments aux indices pairs
    this.list2 = array.filter((_, index) => index % 2 !== 0); // Extraire les éléments aux indices impairs
    this.list1 = this.shuffle(this.list1);
    this.list2 = this.shuffle(this.list2);
  }

  foundPair(tab : BubbleItem[], pair: PairBubbleItem) : BubbleItem | undefined {
    return tab.find(element => element.id === pair.item1.id || element.id === pair.item2.id);
  }


  onAnimationEnd(item : BubbleItem) {
    if (item.state === 'error') {
      item.state = 'unchecked';
    }
  }

  clearClickedList(gotWrong : boolean) {
    if (gotWrong)
      this.clickedList.forEach(element => element.state = 'error');
    this.clickedList = [];
  }

  shuffleChoice() {
    console.log("waiting choice: ", this.waitingChoice);
    let listOfItem2 = this.waitingChoice.map((elem)=>elem.pair.item2)
    listOfItem2 = this.shuffle(listOfItem2);
    this.waitingChoice.forEach((elem, index) => {
      elem.pair.item2 = listOfItem2[index];
    });

  }

  private fillOrdered() : void  {
    this.shuffleChoice();
    for(let i = 0; i < this.waitingChoice.length; i++) {
      const pairToAdd = this.waitingChoice.pop()!;
      this.list1[pairToAdd.index1] = pairToAdd.pair.item1;
      this.list2[pairToAdd.index2] = pairToAdd.pair.item2;
    }
  }
}
