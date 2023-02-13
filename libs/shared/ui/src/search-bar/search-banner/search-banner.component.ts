/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { SearchBar } from '../search-bar';
import { UiSearchBarComponent } from '../search-bar.component';

@Component({
  standalone: true,
  selector: 'ui-search-banner',
  templateUrl: './search-banner.component.html',
  styleUrls: ['./search-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    UiSearchBarComponent
  ]
})
export class UiSearchBannerComponent {
  @Input() bannerTitle!: string;
  @Input() bannerImage!: string;
  @Input() bannerActions?: TemplateRef<any>;
  @Input() bannerSearchbar!: SearchBar<any>;
  @Input() bannerCompletion?: TemplateRef<any>;
  @Input() bannerDescription!: string;

  get bannerImageUrl() {
    return `url(${this.bannerImage})`;
  }
}
