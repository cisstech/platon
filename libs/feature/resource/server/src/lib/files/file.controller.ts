import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { BadRequestResponse, SuccessResponse, UnauthorizedResponse } from '@platon/core/common'
import { Configuration, EventService, IRequest, Public } from '@platon/core/server'
import { PLSourceFile } from '@platon/feature/compiler'
import { ExerciseTransformInput, FileTypes, LATEST, ResourceFile, ResourceTypes } from '@platon/feature/resource/common'
import { Response } from 'express'
import * as fs from 'fs'
import mime from 'mime-types'
import { basename, join } from 'path'
import { FileCreateDTO, FileMoveDTO, FileReleaseDTO, FileRetrieveDTO, FileUpdateDTO } from './file.dto'
import {
  ON_CHANGE_FILE_EVENT,
  ON_RELEASE_REPO_EVENT,
  OnChangeFileEventPayload,
  OnReleaseRepoEventPayload,
} from './file.event'
import { ResourceFileService } from './file.service'
import { RESOURCES_DIR } from './repo'

const CACHEABLE_EXTENSIONS = [
  // IMAGES
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'tiff',
  'bmp',
  'ico',
  'svg',

  // VIDEOS
  'mp4',
  'webm',
  'ogg',
  'mov',
  'avi',
  'wmv',
  'flv',

  // AUDIO
  'mp3',
  'wav',
  'flac',
  'aac',
  'ogg',
  'm4a',

  // FONTS
  'ttf',
  'otf',
  'woff',
  'woff2',
  'eot',

  // DOCUMENTS
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'odt',
  'ods',
  'odp',
]

@Controller('files')
@ApiTags('Resources')
export class ResourceFileController {
  private readonly logger = new Logger(ResourceFileController.name)

  constructor(
    private readonly fileService: ResourceFileService,
    private readonly eventService: EventService,
    private readonly configService: ConfigService<Configuration>
  ) {}

  @Get('/log/:resourceId')
  async log(@Req() request: IRequest, @Param('resourceId') resourceId: string) {
    const { repo, permissions } = await this.fileService.repo(resourceId, request)
    if (!permissions.read) {
      throw new UnauthorizedResponse('You are not allowed')
    }
    return repo.log()
  }

  @Post('/release/:resourceId')
  async release(@Req() request: IRequest, @Param('resourceId') resourceId: string, @Body() input: FileReleaseDTO) {
    const { repo, resource, permissions } = await this.fileService.repo(resourceId, request)
    if (!permissions.write) {
      throw new UnauthorizedResponse('You are not allowed to release this resource')
    }

    await repo.release(input.name, input.message)

    this.eventService.emit<OnReleaseRepoEventPayload>(ON_RELEASE_REPO_EVENT, {
      repo,
      resource,
    })

    return repo.versions()
  }

  @Post('/compile/:resourceId/json')
  async compileExercise(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Query('version') version = LATEST
  ): Promise<PLSourceFile> {
    const { source } = await this.fileService.compile({ resourceId, version, req: request, withAst: true })
    return source
  }

  @Post('/compile/:resourceId/text')
  async transformExercise(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Query('version') version = LATEST,
    @Body() input?: ExerciseTransformInput
  ): Promise<string> {
    const { compiler } = await this.fileService.compile({ resourceId, version, req: request })
    return compiler.toExercise({
      variableChanges: input?.changes || {},
      includeChanges: input?.includes,
    })
  }

  @Public()
  @Get('/:resourceId/:path(*)')
  async get(
    @Req() request: IRequest,
    @Res({ passthrough: true }) res: Response,
    @Param('resourceId') resourceId: string,
    @Param('path') path?: string,
    @Query() query?: FileRetrieveDTO
  ): Promise<unknown> {
    const cacheLifetime = this.configService.get<number>('cache.filesLifetime', { infer: true })

    const { repo, resource, permissions } = await this.fileService.repo(resourceId, request)

    if (query?.zipList) {
      return await repo.listZipFiles(path!)
    }

    const version = query?.version || LATEST
    if (version !== LATEST) {
      res.set('Cache-Control', `public, max-age=${cacheLifetime}`)
    }

    if (query?.bundle) {
      res.set('Content-Type', 'application/x-git-bundle')
      res.set('Content-Disposition', `attachment; filename=${resourceId}.git`)
      const bundle = await repo.bundle(version)
      const stream = fs.createReadStream(bundle)

      stream.on('end', () => {
        fs.promises.rm(bundle, { force: true }).catch(() => {
          this.logger.error(`Failed to remove temporary bundle: ${bundle}`)
        })
      })

      return new StreamableFile(stream)
    }

    if (query?.download) {
      const [node, content] = await repo.read(path, version)

      let file: StreamableFile
      const mimeType = mime.lookup(node.path)
      res.set('Content-Type', mimeType || 'application/octet-stream')

      if (node.type === 'file') {
        const encodedFilename = encodeURIComponent(basename(node.path))
        res.set('Content-Disposition', `attachment; filename=${encodedFilename}`)
        const buffer = (await content) as Uint8Array

        const extension = node.path.split('.').pop()
        if (extension && CACHEABLE_EXTENSIONS.includes(extension)) {
          res.set('Cache-Control', `public, max-age=${cacheLifetime}`)
        }

        file = new StreamableFile(buffer)
      } else {
        const encodedFilename = encodeURIComponent(`platon-${resource.name.trim().replace(/\s/g, '-')}.zip`)
        res.set('Content-Disposition', `attachment; filename=${encodedFilename}`)

        const archive = await repo.archive(path, version)
        const stream = fs.createReadStream(archive)
        file = new StreamableFile(stream)

        stream.on('end', () => {
          fs.promises.rm(archive, { force: true }).catch(() => {
            this.logger.error(`Failed to remove temporary archive: ${archive}`)
          })
        })
      }

      return file
    }

    if (query?.describe) {
      return repo.describe()
    }

    if (query?.versions) {
      return repo.versions()
    }

    if (query?.search) {
      return repo.search({
        query: query.search,
        matchCase: query.match_case,
        matchWord: query.match_word,
        useRegex: query.use_regex,
      })
    }

    const [node, content] = await repo.read(path, version)
    const injectExtraFields = (node: ResourceFile) => {
      node.resourceCode = resource.code
      node.readOnly = !permissions.write || node.version !== LATEST
      node.children?.forEach(injectExtraFields)
    }

    if (node.type === FileTypes.file && !query?.stat) {
      const extension = node.path.split('.').pop()
      if (extension && CACHEABLE_EXTENSIONS.includes(extension)) {
        res.set('Cache-Control', `public, max-age=${cacheLifetime}`)
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return Buffer.from((await content)!.buffer).toString()
    }

    injectExtraFields(node)
    return node
  }

  @Put('/:resourceId/:path(*)')
  @UseInterceptors(
    FileInterceptor('bundle', {
      dest: './resources/bundles',
      preservePath: true,
    })
  )
  async put(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Param('path') path: string,
    @Body() input: FileUpdateDTO,
    @UploadedFile() bundle: Express.Multer.File
  ) {
    const { repo, resource, permissions } = await this.fileService.repo(resourceId, request)
    if (!permissions.write) {
      throw new UnauthorizedResponse('You are not allowed to write this resource')
    }

    if (bundle) {
      try {
        await fs.promises.rename(bundle.path, bundle.path + '.git')
        await repo.mergeBundle(bundle.filename)
      } finally {
        fs.promises.rm(join(RESOURCES_DIR, 'bundles', `${bundle.filename}.git`), { force: true }).catch(() => {
          this.logger.error(`Failed to remove temporary bundle: ${bundle.path}.git`)
        })
      }
      return new SuccessResponse()
    }

    if (input.content == null) {
      throw new BadRequestResponse('You must provide a content')
    }

    const [_, oldContent] = await repo.read(path)
    await repo.write(path, input.content)

    this.eventService.emit<OnChangeFileEventPayload>(ON_CHANGE_FILE_EVENT, {
      repo,
      resource,
      path,
      operation: 'update',
      oldContent: Buffer.from((await oldContent!).buffer).toString() ?? '',
      newContent: input.content,
    })

    return new SuccessResponse()
  }

  @Post('/:resourceId/:path(*)')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './resources/uploads',
      preservePath: true,
    })
  )
  async post(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Body() input: FileCreateDTO[],
    @UploadedFile() file: Express.Multer.File,
    @Param('path') path?: string
  ) {
    const { repo, resource, permissions } = await this.fileService.repo(resourceId, request)
    if (!permissions.write) {
      throw new UnauthorizedResponse('You are not allowed to write this resource')
    }

    if (file) {
      const dstpath = join(path || '', basename(file.originalname))
      await repo.upload(file.path, dstpath)
      this.eventService.emit<OnChangeFileEventPayload>(ON_CHANGE_FILE_EVENT, {
        repo,
        resource,
        path: dstpath,
        operation: 'create',
      })
      return new SuccessResponse()
    }

    if (input?.length) {
      const commitmsgs: string[] = []
      await repo.withNoCommit(async () => {
        for (const file of input) {
          if (file.content != null) {
            await repo.touch(file.path, file.content || '')
          } else {
            await repo.mkdir(file.path)
          }
          commitmsgs.push(`create ${file.path}`)
          this.eventService.emit<OnChangeFileEventPayload>(ON_CHANGE_FILE_EVENT, {
            repo,
            resource,
            path: file.path,
            operation: 'create',
          })
        }
      })

      await repo.commit(commitmsgs.join('\n'))
    }

    return new SuccessResponse()
  }

  @Patch('/:resourceId/:path(*)')
  async patch(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Param('path') path: string,
    @Body() input: FileMoveDTO
  ) {
    const { repo, resource, permissions } = await this.fileService.repo(resourceId, request)
    if (!permissions.write) {
      throw new UnauthorizedResponse('You are not allowed to write this resource')
    }

    if (input.unzip) {
      if (input.unzipFile) {
        await repo.unzipFile(path, input.unzipFile)
      } else {
        await repo.unzip(path)
      }
      return new SuccessResponse()
    }

    if (input.destination == null) {
      throw new BadRequestResponse('You must provide a destination')
    }

    if (input.rename) {
      await repo.rename(path, input.destination!)
      this.eventService.emit<OnChangeFileEventPayload>(ON_CHANGE_FILE_EVENT, {
        repo,
        resource,
        path,
        operation: 'delete',
      })
    } else {
      await repo.move(path, input.destination!, input.copy)
    }

    this.eventService.emit<OnChangeFileEventPayload>(ON_CHANGE_FILE_EVENT, {
      repo,
      resource,
      path: input.destination!,
      operation: 'create',
    })
    return new SuccessResponse()
  }

  @Delete('/:resourceId/:path(*)')
  async delete(@Req() request: IRequest, @Param('resourceId') resourceId: string, @Param('path') path: string) {
    const { repo, resource, permissions } = await this.fileService.repo(resourceId, request)
    if (!permissions.write) {
      throw new UnauthorizedResponse('You are not allowed to write this resource')
    }
    if (!resource.personal && resource.type === ResourceTypes.CIRCLE && request.user.role !== 'admin') {
      throw new UnauthorizedResponse('You are not allowed to delete this resource')
    }

    await repo.remove(path)

    this.eventService.emit<OnChangeFileEventPayload>(ON_CHANGE_FILE_EVENT, {
      repo,
      resource,
      path,
      operation: 'delete',
    })

    return new SuccessResponse()
  }
}
