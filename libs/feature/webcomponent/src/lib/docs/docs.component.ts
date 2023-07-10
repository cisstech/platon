import { Component } from '@angular/core'
import { WebComponentDefinition } from '../web-component'

@Component({
  selector: 'wc-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss'],
})
export class DocsComponent {
  definition!: WebComponentDefinition
}
