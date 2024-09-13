import { Injectable, Logger } from '@nestjs/common'
import { Client, Collection, GuildMember, Role, Snowflake } from 'discord.js'
import { InjectDiscordClient, On } from '@discord-nestjs/core'
import { Public, UserEntity, UserService } from '@platon/core/server'
import { DiscordInvitationService } from '../discord-invitation/discord-invitation.service'
import { UserRoles } from '@platon/core/common'
import { DISCORD_SERVER_ID } from '../feature-discord-server.module'

@Injectable()
export class DiscordWatcherService {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly discordInvitationService: DiscordInvitationService,
    private readonly userService: UserService
  ) {}
  private readonly logger = new Logger(DiscordWatcherService.name)
  private roles?: Collection<Snowflake, Role>

  @Public()
  @On('ready')
  async onReady(): Promise<void> {
    const guild = await this.client.guilds.fetch(DISCORD_SERVER_ID)
    this.roles = await guild.roles.fetch()
  }

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

      this.logger.log(
        `New member ${guildMember.user.username} joined discord with invitation: ${invitation.invitation}`
      )

      const user = await this.userService.update(invitation.userId, { discordId: guildMember.id })
      await this.discordInvitationService.useInvitation(usedInvite, invitation.id)
      await this.addRole(user, guildMember)
    } catch (error) {
      this.logger.error('Failed to find or use the invitation', error)
    }
  }

  private async addRole(user: UserEntity, guildMember: GuildMember): Promise<void> {
    try {
      const role = this.resolveRole(user.role)
      if (role) {
        await guildMember.roles.add(role)
      } else {
        this.logger.warn("User's PLaTon role does not match any discord role")
      }
    } catch (error) {
      this.logger.warn('Failed to add role to guild member', error)
    }
  }

  private resolveRole(role: string): Role | undefined {
    if (!this.roles) {
      throw new Error('Roles not loaded')
    }
    return this.roles.find((r: Role) => r.name === this.translateRole(role))
  }

  private translateRole(role: string): string {
    switch (role) {
      case UserRoles.admin:
        return 'Administrateur'
      case UserRoles.teacher:
        return 'Enseignant'
      case UserRoles.student:
        return 'Étudiant'
      default:
        return 'Membre'
    }
  }
}
