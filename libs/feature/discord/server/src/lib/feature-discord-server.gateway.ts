import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient, On } from '@discord-nestjs/core';
import { Client, Message } from 'discord.js';

@Injectable()
export class FeatureDiscordServerGateway {
  private readonly logger = new Logger(FeatureDiscordServerGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {
    this.logger.log('Client was created!');
  }

}