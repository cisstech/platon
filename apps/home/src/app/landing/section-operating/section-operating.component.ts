import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

@Component({
  standalone: true,
  selector: 'app-landing-section-operating',
  templateUrl: './section-operating.component.html',
  styleUrls: ['./section-operating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class SectionOperatingComponent {}
