/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core'
import { ResourceLoaderService } from '@cisstech/nge/services'
import { JsonEditorComponent, JsonEditorOptions, JsonEditorTreeNode } from 'ang-jsoneditor'
import { firstValueFrom } from 'rxjs'
import { WebComponentDefinition } from '../../web-component'

@Component({
  selector: 'wc-showcase',
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.scss'],
})
export class ShowcaseComponent implements OnInit {
  private readonly elementRef = inject(ElementRef) as ElementRef<HTMLElement>
  private readonly resourceLoader = inject(ResourceLoaderService)
  protected readonly options = new JsonEditorOptions()

  protected component?: any
  protected showEditor = false

  @ViewChild(JsonEditorComponent)
  protected readonly editor?: JsonEditorComponent

  @Input()
  definition!: WebComponentDefinition

  async ngOnInit() {
    await firstValueFrom(this.resourceLoader.loadAllAsync([['style', 'assets/vendors/jsoneditor/jsoneditor.min.css']]))

    const host = this.elementRef.nativeElement.firstElementChild
    this.component = document.createElement(this.definition.selector)

    const { showcase, schema } = this.definition
    if (showcase) {
      this.component.state = {
        ...showcase,
        ...Object.keys(this.definition.schema.properties)
          .filter((k) => {
            return !(k in showcase)
          })
          .reduce((rec, curr) => {
            if (!(curr in showcase)) rec[curr] = schema.properties[curr].default
            return rec
          }, {} as Record<string, any>),
      }
    }
    host?.appendChild(this.component)

    this.options.modes = ['tree']
    this.options.language = 'fr-FR'
    this.options.schema = schema
    this.options.mainMenuBar = false
    this.options.sortObjectKeys = false

    this.options.onEditable = (e) => {
      const node = e as JsonEditorTreeNode
      if (node.field === 'cid' || node.field === 'selector') return false
      return true
    }

    this.options.onBlur = () => {
      const div = this.editor?.jsonEditorContainer.nativeElement as HTMLDivElement
      if (!div) return
      const textNodes = div.querySelectorAll('[class="jsoneditor-value jsoneditor-string"]')
      textNodes.forEach((node) => {
        node.innerHTML = node.textContent?.replace(/\\n/g, '<br/>') || ''
      })
    }
  }

  editorToComponent() {
    try {
      const state = this.editor?.get()
      if (state && this.component) {
        this.component.state = state
      }
    } catch (error) {
      console.error(error)
    }
  }

  componentToEditor() {
    this.editor?.set(this.component.state)
  }
}
