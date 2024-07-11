import { Logger } from '@nestjs/common'
import { Command, CommandRunner } from 'nest-commander'
import * as fs from 'fs'
import { ACTIVITY_MAIN_FILE, ActivityExercise, ActivityExerciseGroup } from '@platon/feature/compiler'
import { ResourceFileService } from '@platon/feature/resource/server'
import { FileNotFoundError, PermissionError } from '@platon/shared/server'
import { NotFoundResponse } from '@platon/core/common'

@Command({
  name: 'sync-activities',
  description: 'Synchronize old activities with the new format (the formats differ)',
})
export class SyncActivities extends CommandRunner {
  private readonly logger = new Logger(SyncActivities.name)
  private errorCount = 0
  constructor(private readonly fileService: ResourceFileService) {
    super()
  }

  public async run(): Promise<void> {
    const path = './resources/activites'
    try {
      let dirs = fs.readdirSync(path)
      dirs = dirs.filter((dir) => !dir.startsWith('.'))
      await Promise.all(
        dirs.map(async (dir) => {
          await this.addDefaultFieldsToGroup(`${path}/${dir}`)
        })
      )
      this.logger.log('Error count: ' + this.errorCount)
    } catch (e) {
      this.logger.error(e)
      this.errorCount++
    }
  }

  private async addDefaultFieldsToGroup(dir: string): Promise<void> {
    const activityDirectory = dir.split('/').pop()
    const content = fs.readFileSync(`${dir}/${ACTIVITY_MAIN_FILE}`, 'utf8')
    const json: { exerciseGroups: Record<string, unknown> } = JSON.parse(content)
    const transformedData = this.transform(json)
    if (Object.keys(transformedData).length === 0) {
      this.logger.log('No transformation needed for ' + activityDirectory)
      return
    }
    const fullJson = { ...json, exerciseGroups: transformedData }
    this.logger.log('Retrieve repository for ' + activityDirectory + '...')
    try {
      const repo = (await this.fileService.repo(activityDirectory!)).repo
      this.logger.log('Write new json for ' + activityDirectory + '...')
      try {
        await repo.write(`${ACTIVITY_MAIN_FILE}`, JSON.stringify(fullJson, null, 2))
      } catch (e) {
        this.errorCount++
        if (e instanceof TypeError) {
          this.logger.error('path null or empty')
        } else if (e instanceof FileNotFoundError) {
          this.logger.error('File not found Error')
        } else if (e instanceof PermissionError) {
          this.logger.error('Permission Error, should not happen')
        }
      }
    } catch (e) {
      this.errorCount++
      if (e instanceof NotFoundResponse) {
        this.logger.error(e.message)
      } else {
        this.logger.error(e)
      }
    }
  }

  private transform(inputData: { exerciseGroups: Record<string, unknown> }): Record<string, ActivityExerciseGroup> {
    const transformedData = {} as Record<string, ActivityExerciseGroup>

    // Iterate over each group in the input data
    for (const key in inputData.exerciseGroups) {
      // eslint-disable-next-line no-prototype-builtins
      if (inputData.exerciseGroups.hasOwnProperty(key)) {
        const group = inputData.exerciseGroups[key]

        // Ensure group is an array of ActivityExercise
        if (Array.isArray(group) && group.every((item) => this.isActivityExercise(item))) {
          transformedData[key] = {
            name: `Groupe ${key}`,
            exercises: group as ActivityExercise[],
          }
        }
      }
    }
    return transformedData
  }

  private isActivityExercise(item: unknown): item is ActivityExercise {
    return typeof item === 'object' && item !== null && 'id' in item && 'version' in item && 'resource' in item
  }
}
