import { Injectable, Logger } from '@nestjs/common'
import { UserService } from './user.service'
import { Cron } from '@nestjs/schedule'

@Injectable()
export class UserSchedulerService {
  private readonly logger = new Logger(UserSchedulerService.name)
  constructor(private readonly userService: UserService) {}

  // Every Monday at 4am
  @Cron('0 4 * * 1')
  async handleCron() {
    this.logger.log('Running scheduled task to delete inactive users')
    await this.userService.deleteInactiveUsers()
  }
}
