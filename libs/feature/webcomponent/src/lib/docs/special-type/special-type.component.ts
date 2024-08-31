import { Component, Input, OnInit } from '@angular/core'

export enum SpecialType {
  None = 0,
  Array = 1,
  Object = 2,
}

@Component({
  selector: 'wc-docs-special-type',
  templateUrl: './special-type.component.html',
  styleUrls: ['./special-type.component.scss'],
})
export class SpecialTypeComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() definition!: any

  ngOnInit(): void {
    console.log(JSON.stringify(this.definition))
  }

  getSpecialType() {
    if (this.definition.type === 'array') {
      return SpecialType.Array
    } else if (this.definition.type === 'object') {
      return SpecialType.Object
    } else {
      return SpecialType.None
    }
  }
}
