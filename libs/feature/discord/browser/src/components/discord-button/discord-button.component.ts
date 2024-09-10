import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  standalone: true,
  selector: 'discord-button',
  templateUrl: './discord-button.component.html',
  styleUrls: ['./discord-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscordButtonComponent {}
