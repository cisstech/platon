import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Injector,
  Input,
  OnDestroy
} from '@angular/core';
import { WebComponent, WebComponentHooks } from '../../web-component';
import { PresenterComponentDefinition, PresenterState } from './presenter';
import { ResourceLoaderService } from '@cisstech/nge/services';
import { BehaviorSubject, ReplaySubject, Subscription, combineLatest, firstValueFrom } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { stripIndent } from 'common-tags';

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

  fullscreen = false;
  template: SafeHtml = '';

  private _subscription?: Subscription;
  private _load = new ReplaySubject<boolean>();
  private _reveal?: any;

  @Input() state!: PresenterState;

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  fullscreenChange(event: any) {
    this.fullscreen = this.document.fullscreenElement ? true : false;
    this._reveal?.layout();
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private _state = new BehaviorSubject<PresenterState>(this.state);

  constructor(
    readonly injector: Injector,
    readonly resourceLoader: ResourceLoaderService,
    @Inject(DOCUMENT) private document: any,
    private readonly sanitizer: DomSanitizer,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async onChangeState() {
    this._state.next(this.state);
  }

  async ngAfterViewInit(): Promise<void> {

    this._subscription = combineLatest([this._state.asObservable(), this._load.asObservable()]).subscribe(([state, load]) => {
      this._reveal?.destroy();
      this.template = this.sanitizer.bypassSecurityTrustHtml(state.template);
      this.changeDetectorRef.markForCheck();
      this.initReveal();
    })

    await firstValueFrom(this.resourceLoader.loadAllSync([
      ['style', 'assets/vendors/revealjs/reveal.css'],
      ['style', 'assets/vendors/revealjs/theme/white.css'],
      ['style', 'assets/vendors/revealjs/plugin/highlight/monokai.css'],
      ['script', 'assets/vendors/revealjs/reveal.js'],
      ['script', 'assets/vendors/revealjs/plugin/markdown/markdown.js'],
      ['script', 'assets/vendors/revealjs/plugin/highlight/highlight.js'],
      ['script', 'assets/vendors/revealjs/plugin/math/math.js'],
    ]));

    this._load.next(true);

  }

  ngOnDestroy(): void {
    this._reveal?.destroy();
    this._subscription?.unsubscribe();
    return;
  }


  private initReveal() {
    setTimeout(() => {
      this._reveal = new Reveal((
        document.querySelector('.r-container')
      ),{
        keyboard: {
          70: null // Disable fullscreen shortcut
        },
        plugins: [ RevealMarkdown, RevealHighlight, RevealMath.KaTeX ]
      });
      this._reveal.initialize();
    }, 300);
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
    this._reveal?.layout();
  }

  closeFullscreen() {
    const element = this.document;

    const fullscreenExitRequest = element.exitFullscreen ||
      element.mozCancelFullScreen ||
      element.webkitExitFullscreen ||
      element.msExitFullscreen;

    fullscreenExitRequest?.apply(element);
    this._reveal?.layout();
  }

}
