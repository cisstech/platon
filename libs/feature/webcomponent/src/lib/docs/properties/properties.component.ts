/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { WebComponentDefinition } from '../../web-component'

@Component({
  selector: 'wc-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesComponent implements OnInit {
  @Input({ required: true }) schema!: WebComponentDefinition['schema']

  protected type = ''
  protected expanded: Record<string, boolean> = {}
  protected properties?: WebComponentDefinition['schema']['properties']
  protected toggleNested(key: string) {
    this.expanded[key] = !this.expanded[key]
  }

  ngOnInit(): void {
    this.properties = this.schema.type === 'object' ? this.schema.properties : (<any>this.schema.items).properties
  }
}
