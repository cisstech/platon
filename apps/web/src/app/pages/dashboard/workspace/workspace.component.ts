import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { SearchBar, SearchBarComponent } from '@platon/shared/ui';

import Fuse from 'fuse.js';
import { of } from 'rxjs';
import { FiltersComponent } from './filters/filters.component';

@Component({
  standalone: true,
  selector: 'app-workspace',
  templateUrl: 'workspace.component.html',
  styleUrls: ['workspace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatCardModule,
    MatButtonModule,

    NzDrawerModule,

    FiltersComponent,
    SearchBarComponent,
  ]
})

export default class WorkspaceComponent {
  protected readonly searchbar: SearchBar<string> = {
    placeholder: 'Essayez un nom, un topic, un niveau...',
    filterer: {
      run: (query) => {
        const suggestions = new Set<string>([
          'AAAA',
          'BBBB',
          'CCCC',
          'DDDD',
        ]);
        return of(new Fuse(Array.from(suggestions), {
          includeMatches: true,
          findAllMatches: false,
          threshold: 0.2,
        }).search(query).map(e => e.item));
      },
    },
    onSearch: this.search.bind(this),
  }

  protected showFilters = false;

  private search(query?: string) {
    console.log(query);
  }
}
