import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

@Component({
  standalone: true,
  selector: 'app-landing-section-footer',
  templateUrl: './section-footer.component.html',
  styleUrls: ['./section-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class SectionFooterComponent {
  protected readonly today = new Date().getFullYear()
}
