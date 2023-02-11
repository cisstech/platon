/* eslint-disable @typescript-eslint/no-explicit-any */
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({ standalone: true, selector: '[uiLayoutTabsTitle]' })
export class LayoutTabsTitleDirective {
  @Input('uiLayoutTabsTitleLink')
  link!: string | any[];

  constructor(
    readonly templateRef: TemplateRef<void>,
    readonly viewContainerRef: ViewContainerRef
  ) {}
}
