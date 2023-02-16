import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuccessResponse } from '@platon/core/common';
import { IRequest, Public } from '@platon/core/server';
import { ResourceFile } from '@platon/feature/resource/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { basename, join } from 'path';
import { FileCreateDTO, FileMoveDTO, FileReleaseDTO, FileRetrieveDTO, FileUpdateDTO } from './file.dto';
import { FileService } from './file.service';
import { LATEST as LATEST_VERSION } from './repo';



@Controller('files')
export class FileController {
  constructor(
    private readonly service: FileService
  ) { }

  @Post('/release/:resourceId')
  async release(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Body() input: FileReleaseDTO
  ) {
    const repo = await this.service.repo(resourceId, request.user);
    await repo.release(input.name, input.message);
    return repo.versions();
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
    const repo = await this.service.repo(resourceId, request.user)
    const version = query?.version || LATEST_VERSION;

    if (query?.bundle) {
      res.set('Content-Type', 'application/force-download');
      res.set('Content-Disposition', 'attachment; filename=file.txt');
      return repo.bundle(version);
    }

    if (query?.download) {
      const [node, download] = await repo.read(path, version);
      res.set('Content-Type', 'application/force-download');
      res.set('Content-Disposition', `attachment; filename=platon.zip`);
      if (node.type === 'file') {
        res.set('Content-Disposition', `attachment; filename=${basename(node.path)}`);
        return new StreamableFile(await download as Uint8Array)
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

    const [node] = await repo.read(path, version);
    const defineUrls = (node: ResourceFile) => {
      const base = `/api/v1/files/${resourceId}/${node.path === '.' ? '' : node.path}`;
      node.url = `${base}?version=${node.version}`;
      node.downloadUrl = `${base}?download&version=${node.version}`;
      node.bundleUrl = `${base}?bundle`;
      node.describeUrl = `${base}?describe`;
      node.resourceId = resourceId;
      node.children?.forEach(defineUrls)
    }

    defineUrls(node);
    return node;
  }

  @Put('/:resourceId/:path(*)')
  async put(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Param('path') path: string,
    @Body() input: FileUpdateDTO,
  ) {
    const repo = await this.service.repo(resourceId, request.user);
    await repo.write(path, input.content);
    return path;
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
    const repo = await this.service.repo(resourceId, request.user);
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
    const repo = await this.service.repo(resourceId, request.user);
    await repo.move(path, input.destination, input.copy);
    return new SuccessResponse();
  }

  @Delete('/:resourceId/:path(*)')
  async delete(
    @Req() request: IRequest,
    @Param('resourceId') resourceId: string,
    @Param('path') path: string
  ) {
    const repo = await this.service.repo(resourceId, request.user);
    await repo.remove(path);
    return new SuccessResponse();
  }
}
