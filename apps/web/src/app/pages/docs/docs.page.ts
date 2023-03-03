import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-docs',
  templateUrl: './docs.page.html',
  styleUrls: ['./docs.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    MatButtonModule,
  ]
})
export class DocsPage { }
