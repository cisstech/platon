import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { RouterModule } from '@angular/router'
import { WebComponentDefinition, WebComponentTypes } from '../../web-component'
import { WebComponentService } from '../../web-component.service'

@Component({
  standalone: true,
  selector: 'wc-docs-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  imports: [CommonModule, RouterModule, MatCardModule],
})
export class ListingComponent implements OnInit {
  type!: WebComponentTypes
  definitions: WebComponentDefinition[] = []

  constructor(private readonly api: WebComponentService) {}

  ngOnInit() {
    this.definitions = this.api.ofType(this.type)
  }

  linkOf(def: WebComponentDefinition) {
    return this.api.linkFromDefinition(def)
  }
}
