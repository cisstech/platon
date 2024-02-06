import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  standalone: true,
  selector: 'app-course-challenges',
  templateUrl: './challenges.page.html',
  styleUrls: ['./challenges.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class ChallengesPage {}
