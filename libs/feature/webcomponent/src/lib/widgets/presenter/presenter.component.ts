import {
  Component,
  AfterViewInit,
  ElementRef,
  OnDestroy,
  Inject,
  HostListener,
  Input,
  Injector,
  ViewChild,
} from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import Reveal from 'reveal.js'
import RevealMarkdown from 'reveal.js/plugin/markdown/markdown.esm.js'
import RevealMath from 'reveal.js/plugin/math/math.esm.js'
import RevealHighlight from 'reveal.js/plugin/highlight/highlight.esm.js'
import { firstValueFrom } from 'rxjs'
import { ResourceLoaderService } from '@cisstech/nge/services'
import { DOCUMENT } from '@angular/common'
import { PresenterComponentDefinition, PresenterState } from './presenter'
import { WebComponent, WebComponentHooks } from '../../web-component'

@Component({
  selector: 'wc-presenter',
  templateUrl: 'presenter.component.html',
  styleUrls: ['presenter.component.scss'],
})
@WebComponent(PresenterComponentDefinition)
export class PresenterComponent implements AfterViewInit, OnDestroy, WebComponentHooks<PresenterState> {
  fullscreen = false
  content: SafeHtml = ''
  private _reveal: Reveal.Api | undefined
  @Input() state!: PresenterState
  @ViewChild('presenterContainer') presenterContainer!: ElementRef<HTMLElement>
  @ViewChild('revealContainer') revealContainer!: ElementRef<HTMLElement>

  constructor(
    private el: ElementRef,
    private readonly sanitizer: DomSanitizer,
    private readonly resourceLoader: ResourceLoaderService,
    @Inject(DOCUMENT) private document: Document,
    readonly injector: Injector
  ) {}

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  fullscreenChange() {
    this.fullscreen = this.document.fullscreenElement ? true : false
    this._reveal?.layout()
  }

  async ngAfterViewInit(): Promise<void> {
    await firstValueFrom(
      this.resourceLoader.loadAllSync([
        ['style', 'assets/vendors/revealjs/reveal.css'],
        ['style', 'assets/vendors/revealjs/theme/white.css'],
        ['style', 'assets/vendors/revealjs/plugin/highlight/monokai.css'],
      ])
    )
  }

  onChangeState() {
    this._reveal?.destroy()
    this.content = this.sanitizer.bypassSecurityTrustHtml(this.state.template)

    const revealOptions: Reveal.Options = {
      plugins: [RevealMarkdown, RevealMath.KaTeX, RevealHighlight],
    }
    setTimeout(() => {
      this._reveal = new Reveal(this.revealContainer.nativeElement, revealOptions)
      this._reveal.initialize().catch(console.error)
    }, 500)
  }

  toggleFullscreen() {
    if (this.fullscreen) {
      this.closeFullscreen().catch(console.error)
    } else {
      this.openFullscreen().catch(console.error)
    }
  }

  async openFullscreen() {
    await this.presenterContainer.nativeElement.requestFullscreen()
    this._reveal?.layout()
  }

  async closeFullscreen() {
    await this.document.exitFullscreen()
    this._reveal?.layout()
  }

  ngOnDestroy(): void {
    this._reveal?.destroy()
  }
}
