import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { DiscordService } from '../../api/discord.service'
import { firstValueFrom } from 'rxjs'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
@Component({
  standalone: true,
  selector: 'discord-invitation',
  templateUrl: './discord-invitation.component.html',
  styleUrls: ['./discord-invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgeMarkdownModule],
})
export class DiscordInvitationComponent implements OnInit {
  constructor(private readonly discordService: DiscordService, private readonly changeDetectorRef: ChangeDetectorRef) {}

  protected url?: string

  async ngOnInit(): Promise<void> {
    this.url = await firstValueFrom(this.discordService.getInvitationLink())
    this.resetGif()
    this.changeDetectorRef.markForCheck()
  }

  protected resetGif(): void {
    const img = document.getElementById('DiscordGif') as HTMLImageElement | null
    if (img) {
      const imageUrl = img.src
      img.src = ''
      img.src = imageUrl
    }
  }
}
