import { Command, Handler } from '@discord-nestjs/core'
import { Injectable, Logger } from '@nestjs/common'
import { Public } from '@platon/core/server'
import { ChatInputCommandInteraction } from 'discord.js'
import { DISCORD_SERVER_ID } from '../feature-discord-server.module'

@Command({
  name: 'invitation',
  description: 'Get an invitation link to the server.',
  defaultMemberPermissions: '8',
})
@Injectable()
export class InvitationCommand {
  private readonly logger = new Logger(InvitationCommand.name)

  @Public()
  @Handler()
  async onInvitation(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.client.guilds.cache.get(DISCORD_SERVER_ID)
    if (!guild) {
      this.logger.error('Guild not found')
      await interaction.reply('Failed to find the guild.')
      return
    }

    await interaction.reply('This command is a test')
  }
}
