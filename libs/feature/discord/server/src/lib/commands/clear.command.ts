import { Command, Handler } from '@discord-nestjs/core'
import { Injectable, Logger } from '@nestjs/common'
import { Public } from '@platon/core/server'
import { ChatInputCommandInteraction, TextChannel } from 'discord.js'

@Command({
  name: 'clear',
  description: 'Clear messages',
  defaultMemberPermissions: '8',
})
@Injectable()
export class ClearCommand {
  private readonly logger = new Logger(ClearCommand.name)

  @Public()
  @Handler()
  async onClear(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel

    if (!channel) {
      await interaction.reply({ content: 'Commande non supportée dans ce type de canal.', ephemeral: true })
      return
    }

    let deletedMessagesCount = 0
    const fetchLimit = 100

    try {
      await interaction.deferReply()

      let messages
      do {
        messages = await channel.messages.fetch({ limit: fetchLimit })
        const deletedMessages = await channel.bulkDelete(messages, true)
        deletedMessagesCount += deletedMessages.size
      } while (messages.size === fetchLimit)
      await interaction.followUp(`Tous les messages ont été supprimés. Total: ${deletedMessagesCount}`)
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression des messages: ${error}`)
      await interaction.followUp('Une erreur est survenue lors de la suppression des messages.')
    }
  }
}
