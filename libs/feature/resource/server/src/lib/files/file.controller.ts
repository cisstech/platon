import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuccessResponse } from '@platon/core/common';
import { IRequest, Public } from '@platon/core/server';
import { FileTypes, ResourceFile } from '@platon/feature/resource/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { basename, join } from 'path';
import { FileCreateDTO, FileMoveDTO, FileReleaseDTO, FileRetrieveDTO, FileUpdateDTO } from './file.dto';
import { ResourceFileService } from './file.service';
import { LATEST, LATEST as LATEST_VERSION } from './repo';



@Controller('files')
export class ResourceFileController {
  constructor(
    private readonly service: ResourceFileService
  ) { }

  @Post('/release/:resourceId')
  async release(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Body() input: FileReleaseDTO
  ) {
    const [repo] = await this.service.repo(resourceId, request.user);
    await repo.release(input.name, input.message);
    return repo.versions();
  }

  @Post('/compile/:resourceId')
  async compile(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Query('version') version = LATEST,
  ) {
    const [source] = await this.service.compile(resourceId, version, request.user);
    return source;
  }

  @Public()
  @Get('/:resourceId/:path(*)')
  async get(
    @Req() request: IRequest,
    @Res({ passthrough: true }) res: Response,
    @Param('resourceId') resourceId: string,
    @Param('path') path?: string,
    @Query() query?: FileRetrieveDTO,
  ): Promise<unknown> {
    const [repo, resource] = await this.service.repo(resourceId, request.user)
    const version = query?.version || LATEST_VERSION;
    if (query?.bundle) {
      res.set('Content-Type', 'application/force-download');
      res.set('Content-Disposition', 'attachment; filename=file.txt');
      return repo.bundle(version);
    }

    if (query?.download) {
      const [node, content] = await repo.read(path, version);
      res.set('Content-Type', 'application/force-download');
      res.set('Content-Disposition', `attachment; filename=platon.zip`);
      if (node.type === 'file') {
        res.set('Content-Disposition', `attachment; filename=${basename(node.path)}`);
        return new StreamableFile(await content as Uint8Array)
      }
      return new StreamableFile(
        createReadStream(await repo.archive(path, version))
      );
    }

    if (query?.describe) {
      return repo.describe();
    }

    if (query?.versions) {
      return repo.versions();
    }

    if (query?.search) {
      return repo.search({
        query: query.search,
        matchCase: query.match_case,
        matchWord: query.match_word,
        useRegex: query.use_regex
      })
    }

    const [node, content] = await repo.read(path, version);
    const defineCodes = (node: ResourceFile) => {
      node.resourceCode = resource.code
      node.children?.forEach(defineCodes)
    }

    if (node.type === FileTypes.file) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return Buffer.from((await content)!.buffer).toString();
    }

    defineCodes(node);
    return node;
  }

  @Put('/:resourceId/:path(*)')
  async put(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Param('path') path: string,
    @Body() input: FileUpdateDTO,
  ) {
    const [repo] = await this.service.repo(resourceId, request.user);
    await repo.write(path, input.content);
    return new SuccessResponse();
  }

  @Post('/:resourceId/:path(*)')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
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
    const [repo] = await this.service.repo(resourceId, request.user);
    if (file) {
      await repo.upload(file.path, join(path || '', basename(file.originalname)));
      return new SuccessResponse();
    }
    if (input?.length) {
      await repo.withNoCommit(async () => {
        for (const file of input) {
          if (file.content != null) {
            await repo.touch(file.path, file.content || '');
          } else {
            await repo.mkdir(file.path);
          }
        }
      });
      await repo.commit('create new files');
    }
    return new SuccessResponse();
  }

  @Patch('/:resourceId/:path(*)')
  async patch(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Param('path') path: string,
    @Body() input: FileMoveDTO,
  ) {
    const [repo] = await this.service.repo(resourceId, request.user);
    if (input.rename) {
      await repo.rename(path, input.destination);
    } else {
      await repo.move(path, input.destination, input.copy);
    }
    return new SuccessResponse();
  }

  @Delete('/:resourceId/:path(*)')
  async delete(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Param('path') path: string
  ) {
    const [repo] = await this.service.repo(resourceId, request.user);
    await repo.remove(path);
    return new SuccessResponse();
  }
}
