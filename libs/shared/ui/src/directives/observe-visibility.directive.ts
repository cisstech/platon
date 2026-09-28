import { Directive, ElementRef, Output, EventEmitter, Input, inject, OnDestroy } from '@angular/core'

@Directive({
  selector: '[uiObserveVisibility]',
  standalone: true,
})
export class ObserveVisibilityDirective implements OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef)
  private observer?: IntersectionObserver

  @Output() visible = new EventEmitter<void>()

  @Input() set uiObserveVisibility(shouldObserve: boolean) {
    if (shouldObserve) {
      this.startObserving()
    } else {
      this.stopObserving()
    }
  }

  private startObserving() {
    if (this.observer) return

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.visible.emit()
          this.stopObserving() // On émet l'évènement une seule fois et on arrête d'observer l'élément
        }
      },
      {
        rootMargin: '0px 0px 0px 0px',
        threshold: 0,
      }
    )

    this.observer.observe(this.el.nativeElement)
  }

  private stopObserving() {
    this.observer?.disconnect()
    this.observer = undefined
  }

  ngOnDestroy() {
    this.stopObserving()
  }
}
