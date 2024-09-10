import { Injectable, Logger } from '@nestjs/common'
import { Client, GuildMember } from 'discord.js'
import { InjectDiscordClient, On } from '@discord-nestjs/core'
import { Public, UserService } from '@platon/core/server'
import { DiscordInvitationService } from '../discord-invitation/discord-invitation.service'

@Injectable()
export class DiscordWatcherService {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly discordInvitationService: DiscordInvitationService,
    private readonly userService: UserService
  ) {}
  private readonly logger = new Logger(DiscordWatcherService.name)

  @Public()
  @On('guildMemberAdd')
  async onGuildMemberAdd(guildMember: GuildMember): Promise<void> {
    const invites = await guildMember.guild.invites.fetch()
    const usedInvite = invites.find((invite) => invite?.uses === 1)

    if (!usedInvite) {
      this.logger.error('This should never happen...')
      return
    }

    try {
      const invitation = await this.discordInvitationService.findInvitationByUrl(usedInvite.url)

      if (!invitation) {
        this.logger.error('No invitation found for the new discord member...')
        return
      }

      this.logger.log(`New member ${guildMember.user.username} joined discord with invitation: ${invitation.id}`)

      await this.userService.update(invitation.userId, { discordId: guildMember.id })
      await this.discordInvitationService.useInvitation(usedInvite, invitation.id)
    } catch (error) {
      this.logger.error('Failed to find or use the invitation', error)
    }
  }
}
