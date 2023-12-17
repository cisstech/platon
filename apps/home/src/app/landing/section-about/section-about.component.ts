import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

@Component({
  standalone: true,
  selector: 'app-landing-section-about',
  templateUrl: './section-about.component.html',
  styleUrls: ['./section-about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class SectionAboutComponent {}
