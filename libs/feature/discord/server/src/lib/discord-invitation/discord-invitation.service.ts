import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DiscordInvitationEntity } from './discord-invitation.entity'
import { Repository } from 'typeorm'
import { ChannelType, Client, Guild, Invite } from 'discord.js'
import { DISCORD_SERVER_ID } from '../feature-discord-server.service'
import { InjectDiscordClient, On } from '@discord-nestjs/core'
import { Public, UserService } from '@platon/core/server'
import { ErrorResponse, ItemResponse } from '@platon/core/common'

const MAX_INVITATION_AGE = 24 * 60 * 60
const MAX_INVITATION_USES = 2
const UNIQUE_INVITATION = true

@Injectable()
export class DiscordInvitationService {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    @InjectRepository(DiscordInvitationEntity)
    private readonly discordInvitationRepository: Repository<DiscordInvitationEntity>,
    private readonly userService: UserService
  ) {}

  private readonly logger = new Logger(DiscordInvitationService.name)
  private guild: Guild | undefined

  @Public()
  @On('ready')
  async onReady(): Promise<void> {
    this.guild = await this.client.guilds.fetch(DISCORD_SERVER_ID)
    this.guild = this.client.guilds.cache.get(DISCORD_SERVER_ID)
    this.logger.log('Discord invitation service ready')
  }

  getInvitationLink = async (userId: string): Promise<ItemResponse<string>> => {
    try {
      // Si l'utilisateur à un discordId, on lui renvoie le lien d'invitation
      const user = (await this.userService.findById(userId)).get()
      if (user.discordId) {
        throw new ErrorResponse({ status: 500, message: 'User is already linked to Discord' })
      }

      return new ItemResponse({
        resource: (await this.getExistingInvitation(userId)) || (await this.createInvitationLink(userId)),
      })
    } catch (error) {
      throw new ErrorResponse({ status: 500, message: 'Error while creating invitation link' })
    }
  }

  private createInvitationLink = async (userId: string): Promise<string> => {
    if (!this.guild) {
      throw new Error('Failed to find the guild.')
    }
    const invitationChannel = this.guild.channels.cache
      .filter((channel) => channel.type === ChannelType.GuildText) // TODO: Get the right channel
      .first()
    if (!invitationChannel) {
      throw new Error('No text channel found in the guild')
    }

    const invitation = await this.guild.invites.create(invitationChannel.id, {
      maxAge: MAX_INVITATION_AGE,
      maxUses: MAX_INVITATION_USES,
      unique: UNIQUE_INVITATION,
    })

    await this.discordInvitationRepository.save({
      userId: userId,
      invitation: invitation.url,
      date: new Date(),
    })

    return invitation.url
  }

  private getExistingInvitation = async (userId: string): Promise<string | undefined> => {
    const invitationEntity = await this.discordInvitationRepository.findOne({
      where: { userId: userId },
    })

    if (!invitationEntity) {
      return undefined
    }

    if (!this.isInvitationValid(invitationEntity)) {
      await this.discordInvitationRepository.delete(invitationEntity.id)
      return undefined
    }
    return invitationEntity.invitation
  }

  private isInvitationValid = (invitationEntity: DiscordInvitationEntity): boolean => {
    const currentTime = new Date().getTime()
    const invitationTime = invitationEntity.date.getTime()
    const invitationAge = (currentTime - invitationTime) / 1000
    return invitationAge < MAX_INVITATION_AGE
  }

  async findInvitationByUrl(url: string): Promise<DiscordInvitationEntity | undefined> {
    const invitation = await this.discordInvitationRepository.findOne({ where: { invitation: url } })
    return invitation || undefined
  }

  async useInvitation(usedInvite: Invite, invitation: string): Promise<void> {
    await usedInvite.delete()
    await this.discordInvitationRepository.delete(invitation)
  }
}
