import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

@Component({
  standalone: true,
  selector: 'app-landing-section-header',
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class SectionHeaderComponent {
  protected readonly links = [
    {
      icon: 'info',
      title: 'Présentation',
      href: '#about',
    },
    {
      icon: 'engineering',
      title: 'Fonctionnement',
      href: '#operating',
    },

    {
      icon: 'star_rate',
      title: 'Fonctionnalités',
      href: '#features',
    },

    {
      icon: 'slideshow',
      title: 'Demonstration',
      href: '#demo',
    },
  ]
}
