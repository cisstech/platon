/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentChild, Directive, Input, TemplateRef } from '@angular/core';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ standalone: true, selector: 'ui-layout-tab' })
export class UiLayoutTabsTitleDirective {
  @Input()
  link!: string | any[];

  @Input()
  linkParams?: any;

  @ContentChild(TemplateRef, { static: true })
  templateRef!: TemplateRef<void>
}
