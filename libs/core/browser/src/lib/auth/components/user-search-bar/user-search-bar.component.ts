/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';

import { NgeUiListModule } from '@cisstech/nge/ui/list';
import { User, UserRoles } from '@platon/core/common';
import { SearchBar, UiSearchBarComponent } from '@platon/shared/ui';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserService } from '../../api/user.service';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';


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

    MatButtonModule,

    NzIconModule,

    NgeUiListModule,

    UserAvatarComponent,
    UiSearchBarComponent,
  ]
})
export class UserSearchBarComponent implements ControlValueAccessor {
  @Input() roles?: (UserRoles | keyof typeof UserRoles)[];
  @Input() multi = true;
  @Input() excludes: string[] = [];
  @Input() disabled = false;

  readonly searchbar: SearchBar<User> = {
    placeholder: 'Essayez un nom, un email...',
    filterer: {
      run: this.search.bind(this),
    },
    complete: item => item.username,
    onSelect: user => {
      this.searchbar.value = '';

      if (!this.multi) {
        this.selection = [];
      }

      this.selection.push(user);
      this.onChangeSelection();
    }
  };

  selection: User[] = [];

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

  search(query: string): Observable<User[]> {
    return this.userService
      .search({
        roles: this.roles as unknown as UserRoles[],
        search: query,
      })
      .pipe(
        map((page) => {
          return page.resources.filter(
            this.isSelectable.bind(this)
          ).slice(0, 5);
        })
      );
  }

  remove(item: User): void {
    this.selection = this.selection.filter(
      e => e.id !== item.id
    );
    this.onChangeSelection();
  }

  private isSelectable(user: User): boolean {
    const isSelected = this.selection.find(e => e.id === user.id)
    const isExclued = this.excludes.find(e => e === user.username || e === user.id);
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
