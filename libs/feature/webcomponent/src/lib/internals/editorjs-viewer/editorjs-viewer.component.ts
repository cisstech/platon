import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core'
import EdjsParser from 'editorjs-parser'

// TODO implements custom editorjs parser https://github.com/miadabdi/editorjs-parser#custom-or-overriding-parser-methods

@Component({
  selector: 'wc-editorjs-viewer',
  templateUrl: './editorjs-viewer.component.html',
  styleUrls: ['./editorjs-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorjsViewerComponent implements OnInit {
  private readonly parser = new EdjsParser()
  @ViewChild('container', { static: true })
  protected container!: ElementRef<HTMLElement>

  @ViewChild('transclusion', { static: true })
  protected transclusion!: ElementRef<HTMLElement>

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    const contentNode = this.transclusion.nativeElement
    const containerNode = this.container.nativeElement
    try {
      const content = contentNode.textContent?.trim() || '{}'
      const data = JSON.parse(content)
      containerNode.innerHTML = this.parser.parse(data)
      this.changeDetectorRef.detectChanges()
    } catch (error) {
      console.warn('Error parsing Editor.js output:', error)
    }
  }
}
