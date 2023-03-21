/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NgeUiListModule } from '@cisstech/nge/ui/list';
import { User, UserFilters, UserGroup } from '@platon/core/common';
import { SearchBar, UiSearchBarComponent } from '@platon/shared/ui';
import { UserService } from '../../api/user.service';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

type Item = User | UserGroup;

@Component({
  standalone: true,
  selector: 'user-search-bar',
  templateUrl: './user-search-bar.component.html',
  styleUrls: ['./user-search-bar.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserSearchBarComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    NzIconModule,
    NzButtonModule,

    NgeUiListModule,

    UserAvatarComponent,
    UiSearchBarComponent,
  ]
})
export class UserSearchBarComponent implements OnInit, ControlValueAccessor {
  @Input() multi = true;
  @Input() excludes: string[] = [];
  @Input() disabled = false;
  @Input() allowGroup = false;
  @Input() onlyGroups = false;
  @Input() autoSelect = false;

  @Input() filters: UserFilters = {
    limit: 5
  }

  readonly searchbar: SearchBar<Item> = {
    placeholder: 'Essayez un nom, un email...',
    filterer: {
      run: this.search.bind(this),
    },
    complete: item => 'username' in item ? item.username : item.name,
    onSelect: item => {
      if (this.autoSelect)
        return;

      this.searchbar.value = '';
      if (!this.multi) {
        this.selection = [];
      }

      this.selection.push(item);
      this.onChangeSelection();
    }
  };

  selection: Item[] = [];


  constructor(
    private readonly userService: UserService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if (this.allowGroup) {
      this.searchbar.placeholder = 'Essayez un nom, un email, un groupe...';
    }
    if (this.onlyGroups) {
      this.searchbar.placeholder = 'Essayez un nom...';
    }
  }
  // ControlValueAccessor methods

  onTouch: any = () => {
    //
  }
  onChange: any = () => {
    //
  }

  writeValue(value: any): void {
    this.selection = Array.isArray(value)
      ? value
      : value ? [value] : [];
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected isUser(item: Item): item is User {
    return 'username' in item;
  }

  protected search(query: string): Observable<Item[]> {
    const requests: Observable<Item[]>[] = [];

    if (!this.onlyGroups) {
      requests.push(
        this.userService
          .search({
            ...this.filters,
            search: query,
          })
          .pipe(
            map((page) => {
              if (this.autoSelect) {
                return page.resources;
              }
              return page.resources.filter(
                this.isSelectable.bind(this)
              )
            })
          )
      )
    }


    if (this.allowGroup || this.onlyGroups) {
      requests.push(
        this.userService
          .searchUserGroups({
            search: query,
            limit: this.filters.limit ?? 5
          })
          .pipe(
            map((page) => {
              if (this.autoSelect) {
                return page.resources;
              }

              return page.resources.filter(
                this.isSelectable.bind(this)
              )
            })
          )
      );
    }

    return combineLatest(requests).pipe(
      map(res => {
        const flat = res.flat();
        if (this.autoSelect) {
          this.selection = flat;
          this.onChangeSelection();
        }
        return flat.slice(0, 5)
      })
    )
  }

  protected remove(item: Item): void {
    this.selection = this.selection.filter(
      e => e.id !== item.id
    );
    this.onChangeSelection();
  }

  private isSelectable(item: Item): boolean {
    const isSelected = this.selection.find(e => e.id === item.id)
    const isExclued = this.excludes.find(userOrGroup => {
      if ('username' in item) {
        return userOrGroup === item.username || userOrGroup === item.id;
      }
      return userOrGroup === item.id;
    });
    return !isSelected && !isExclued;
  }


  private onChangeSelection(): void {
    if (this.multi) {
      this.onTouch(this.selection);
      this.onChange(this.selection);
    } else {
      this.onTouch(this.selection[0]);
      this.onChange(this.selection[0]);
    }
    this.changeDetectorRef.markForCheck();
  }
}
