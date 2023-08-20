import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  standalone: true,
  selector: 'app-corrections-availables',
  templateUrl: './availables.page.html',
  styleUrls: ['./availables.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class CorrectionsAvailablesPage {}
