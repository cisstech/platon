/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  booleanAttribute,
} from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Subscription } from 'rxjs'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import { SearchBar } from './search-bar'

import { MatIconModule } from '@angular/material/icon'
import { NgArrayPipesModule } from 'ngx-pipes'

import { MatButtonModule } from '@angular/material/button'
import { NzAutocompleteModule, NzOptionSelectionChange } from 'ng-zorro-antd/auto-complete'
import { NzSpinModule } from 'ng-zorro-antd/spin'

const DEFAULT_DEBOUNCE_TIME = 200
@Component({
  standalone: true,
  selector: 'ui-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatIconModule,
    MatButtonModule,

    NzSpinModule,
    NzAutocompleteModule,

    NgArrayPipesModule,
  ],
})
export class UiSearchBarComponent implements OnInit, OnChanges, OnDestroy {
  private readonly subscriptions: Subscription[] = []

  @ViewChild('searchRef', { read: ElementRef })
  searchRef?: ElementRef<HTMLInputElement>

  @Input() searchbar?: SearchBar<any>
  @Input({ transform: booleanAttribute }) disabled = false

  @ContentChild(TemplateRef)
  suggestionTemplate?: TemplateRef<any>

  @Output() search = new EventEmitter<string>()
  @Output() filter = new EventEmitter<void>()

  protected control = new FormControl()
  protected suggesting = false
  protected suggestions: any[] = []

  @HostBinding('class')
  protected get hostClass(): string {
    return this.disabled ? 'mat-elevation-z1' : 'mat-elevation-z2'
  }

  protected get showFilterButton(): boolean {
    return !!this.searchbar?.onFilter || this.filter.observed
  }

  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.control.valueChanges
        .pipe(
          debounceTime(DEFAULT_DEBOUNCE_TIME), // Wait for the user to stop typing (200 milliseconds in this case)
          distinctUntilChanged(), // Wait until the search text changes.
          switchMap((query) => {
            this.startFiltering(query)
            return []
          }) // https://angular.io/guide/http#using-the-switchmap-operator
        )
        .subscribe()
    )

    this.control.patchValue(this.searchbar?.value || '')

    this.defineSetterForValueProperty()

    setTimeout(() => {
      this.searchbar?.onReady?.()
    }) // avoid ExpressionChangedAfterItHasBeenCheckedError
  }

  ngOnChanges(): void {
    if (this.disabled) {
      this.control.disable()
    } else if (!this.control.enabled) {
      this.control.enable()
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected onFilter(): void {
    this.searchbar?.onFilter?.()
    this.filter.next()
  }

  protected onTrigger(): void {
    this.searchbar?.onSearch?.(this.control.value)
    this.search.next(this.control.value)
  }

  protected onSelect(event: NzOptionSelectionChange, item: any): void {
    if (event.isUserInput) {
      this.searchbar?.onSelect?.(item)
      if (this.searchbar?.clearOnSelect) {
        setTimeout(() => {
          this.control.setValue('', { emitEvent: false })
          this.searchRef?.nativeElement?.blur?.()
        })
      } else {
        this.control.setValue(this.onComplete(item), { emitEvent: false })
        this.onTrigger()
      }
    }
  }

  protected onComplete(item: any): any {
    if (this.searchbar?.complete) {
      return this.searchbar.complete(item)
    }
    return item
  }

  protected stopFiltering(): void {
    this.subscriptions.forEach((s, i) => {
      if (i > 0) {
        s.unsubscribe()
      }
    })
    this.subscriptions.splice(1, this.subscriptions.length)
  }

  protected startFiltering(query?: string): void {
    this.suggesting = true
    this.suggestions = []
    this.changeDetector.markForCheck()

    this.stopFiltering()

    if (this.searchbar?.filterer?.run) {
      this.subscriptions.push(
        this.searchbar.filterer.run(query || '').subscribe({
          next: (response) => {
            this.suggestions = response
            this.suggesting = false
            this.changeDetector.markForCheck()
            this.stopFiltering()
          },
          error: (error) => {
            console.error(error)
            this.stopFiltering()
          },
        })
      )
    }
  }

  private defineSetterForValueProperty(): void {
    if (this.searchbar && !Object.getOwnPropertyDescriptor(this.searchbar, 'value')?.set) {
      Object.defineProperty(this.searchbar, 'value', {
        get: () => this.control.value,
        set: (value: string) => {
          this.control.setValue(value || '')
          this.onTrigger()
          this.changeDetector.markForCheck()
        },
      })
    }
  }
}
