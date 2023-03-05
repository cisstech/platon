/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { NgeUiListModule } from '@cisstech/nge/ui/list';
import { User, UserGroup, UserRoles } from '@platon/core/common';
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
  @Input() roles?: (UserRoles | keyof typeof UserRoles)[];
  @Input() multi = true;
  @Input() excludes: string[] = [];
  @Input() disabled = false;

  @Input() allowGroup = false;

  readonly searchbar: SearchBar<Item> = {
    placeholder: 'Essayez un nom, un email...',
    filterer: {
      run: this.search.bind(this),
    },
    complete: item => 'username' in item ? item.username : item.name,
    onSelect: item => {
      this.searchbar.value = '';

      if (!this.multi) {
        this.selection = [];
      }

      this.selection.push(item);
      this.onChangeSelection();
    }
  };

  selection: Item[] = [];

  onTouch: any = () => {
    //
  }
  onChange: any = () => {
    //
  }


  constructor(
    private readonly userService: UserService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if (this.allowGroup) {
      this.searchbar.placeholder = 'Essayez un nom, un email, un groupe...';
    }
  }
  // ControlValueAccessor methods

  writeValue(value: any): void {
    this.selection = value || [];
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
    const requests: Observable<Item[]>[] = [
      this.userService
        .search({
          roles: this.roles as unknown as UserRoles[],
          search: query,
          limit: 5
        })
        .pipe(
          map((page) => {
            return page.resources.filter(
              this.isSelectable.bind(this)
            )
          })
        )
    ];

    if (this.allowGroup) {
      requests.push(
        this.userService
          .searchUserGroups({
            search: query,
            limit: 5
          })
          .pipe(
            map((page) => {
              return page.resources.filter(
                this.isSelectable.bind(this)
              )
            })
          )
      );
    }

    return combineLatest(requests).pipe(
      map(res => res.flat().slice(0, 5))
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
