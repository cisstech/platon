import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { DemoLinkGroup } from '../landing.service'

@Component({
  standalone: true,
  selector: 'app-landing-section-demo',
  templateUrl: './section-demo.component.html',
  styleUrls: ['./section-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class SectionDemoComponent {
  @Input() demos: DemoLinkGroup[] = []
}
