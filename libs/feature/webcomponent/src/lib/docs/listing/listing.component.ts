import { Component, OnInit } from '@angular/core';
import { WebComponentDefinition, WebComponentTypes } from '../../web-component';
import { WebComponentService } from '../../web-component.service';

@Component({
  selector: 'wc-docs-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent implements OnInit {
  type!: WebComponentTypes;
  definitions: WebComponentDefinition[] = [];

  constructor(private readonly api: WebComponentService) {}

  ngOnInit() {
    this.definitions = this.api.ofType(this.type);
  }

  linkOf(def: WebComponentDefinition) {
    return this.api.linkFromDefinition(def);
  }
}
