import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Injector,
  Input,
  OnDestroy,
} from '@angular/core';
import { WebComponent, WebComponentHooks } from '../../web-component';
import { PresenterComponentDefinition, PresenterState } from './presenter';
import { ResourceLoaderService } from '@cisstech/nge/services';
import { firstValueFrom } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare const Reveal: any;
declare const RevealMarkdown: any;
declare const RevealHighlight: any;
declare const RevealMath: any;

@Component({
  selector: 'wc-presenter',
  templateUrl: 'presenter.component.html',
  styleUrls: ['presenter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@WebComponent(PresenterComponentDefinition)
export class PresenterComponent implements AfterViewInit, OnDestroy, WebComponentHooks<PresenterState> {

  private reveal?: any;
  fullscreen = false;
  template: SafeHtml = '';

  @Input() state!: PresenterState;

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  fullscreenChange(event: any) {
    this.fullscreen = this.document.fullscreenElement ? true : false;
  }

  constructor(
    readonly injector: Injector,
    readonly resourceLoader: ResourceLoaderService,
    @Inject(DOCUMENT) private document: any,
    private readonly sanitizer: DomSanitizer,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  onChangeState() {
    this.reveal?.destroy();
    this.template = this.sanitizer.bypassSecurityTrustHtml(this.state.template);
    this.changeDetectorRef.markForCheck();
    this.initReveal();
  }

  async ngAfterViewInit(): Promise<void> {
    await firstValueFrom(this.resourceLoader.loadAllSync([
      ['style', 'assets/vendors/revealjs/reveal.css'],
      ['style', 'assets/vendors/revealjs/theme/white.css'],
      ['style', 'assets/vendors/revealjs/plugin/highlight/monokai.css'],
      ['script', 'assets/vendors/revealjs/reveal.js'],
      ['script', 'assets/vendors/revealjs/plugin/markdown/markdown.js'],
      ['script', 'assets/vendors/revealjs/plugin/highlight/highlight.js'],
      ['script', 'assets/vendors/revealjs/plugin/math/math.js'],
    ]));
    this.initReveal();
  }

  ngOnDestroy(): void {
    if (this.reveal) this.reveal.destroy();
  }

  initReveal() {
    setTimeout(() => {
      this.reveal = new Reveal((
        document.querySelector('.r-container')
      ),{
        keyboard: {
          70: null // Disable fullscreen shortcut
        },
        plugins: [ RevealMarkdown, RevealHighlight, RevealMath.KaTeX ]
      });
      this.reveal.initialize();
    }, 100);
  }

  toggleFullscreen() {
    if (this.fullscreen) {
      this.closeFullscreen();
    } else {
      this.openFullscreen();
    }
  }

  openFullscreen() {
    const element = this.document.documentElement;

    const fullscreenRequest = element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.webkitRequestFullScreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen;

    fullscreenRequest?.apply(element);
    this.reveal?.layout();
  }

  closeFullscreen() {
    const element = this.document;

    const fullscreenExitRequest = element.exitFullscreen ||
      element.mozCancelFullScreen ||
      element.webkitExitFullscreen ||
      element.msExitFullscreen;

    fullscreenExitRequest?.apply(element);
    this.reveal?.layout();
  }

}
