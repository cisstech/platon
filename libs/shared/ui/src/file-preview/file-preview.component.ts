/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'

import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

import { NzInputNumberModule } from 'ng-zorro-antd/input-number'

import { FormsModule } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import {
  SUPPORTED_IMAGE_EXTENSIONS,
  SUPPORTED_TEXT_EXTENSIONS,
  SUPPORTED_VIDEO_EXTENSIONS,
  extractSupportedExtension,
} from './file-preview'
import { NzInputModule } from 'ng-zorro-antd/input'

@Component({
  standalone: true,
  selector: 'ui-file-preview',
  templateUrl: 'file-preview.component.html',
  styleUrl: 'file-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzInputNumberModule,
    NgeMarkdownModule,
  ],
})
export class UiFilePreviewComponent implements OnChanges {
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  @Input({ required: true }) src!: string
  @ViewChild('pdfCanvas', { static: false, read: ElementRef })
  pdfCanvas?: ElementRef<HTMLCanvasElement> | undefined
  protected isImage = false
  protected isVideo = false
  protected isText = false
  protected isPdf = false
  protected unsupported = false
  protected pdfDocument: any
  protected currentPage = 1
  protected totalPages = 0
  protected scale = 1.0

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.src) {
      this.updateDisplayType()
      if (this.isPdf) {
        setTimeout(() => this.loadPDF(), 0) // wait for pdfCanvas to be defined
      }
    }
  }
  protected onNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.renderPage(this.currentPage)
    }
  }

  protected onPrevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--
      this.renderPage(this.currentPage)
    }
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.renderPage(this.currentPage)
    }
  }

  protected zoomIn(): void {
    this.scale *= 1.1
    this.renderPage(this.currentPage)
  }

  protected zoomOut(): void {
    if (this.scale > 0.5) {
      // Prevent too much zoom out
      this.scale *= 0.9
      this.renderPage(this.currentPage)
    }
  }
  private updateDisplayType(): void {
    const extension = extractSupportedExtension(this.src)
    if (!extension) {
      this.unsupported = true
      return
    }

    this.isImage = SUPPORTED_IMAGE_EXTENSIONS.includes(extension)
    this.isVideo = SUPPORTED_VIDEO_EXTENSIONS.includes(extension)
    this.isText = SUPPORTED_TEXT_EXTENSIONS.includes(extension)
    this.isPdf = extension === 'pdf'
  }

  private loadPDF(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
    const loadingTask = pdfjsLib.getDocument(this.src)
    loadingTask.promise.then((pdf: any) => {
      this.pdfDocument = pdf
      this.totalPages = pdf.numPages
      this.renderPage(this.currentPage)
      this.changeDetectorRef.detectChanges()
    })
  }

  private renderPage(pageNumber: number): void {
    this.pdfDocument.getPage(pageNumber).then((page: any) => {
      const canvas = this.pdfCanvas?.nativeElement as HTMLCanvasElement
      const context = canvas.getContext('2d')
      const viewport = page.getViewport({ scale: this.scale })
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }
      page.render(renderContext)
    })
  }
}
