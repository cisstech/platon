import { Injectable } from '@nestjs/common';
import { PLSourceFile, PLSourceFileTypes } from '@platon/feature/compiler';
import { basename } from 'path';
import { SandboxService } from './sandbox.service';
import * as nunjucks from 'nunjucks';
import { ActivityLayout, ExerciseLayout, ResourceLayout } from '@platon/feature/player/common';
import { SandboxResponse } from './sandboxes';


@Injectable()
export class PlayerService {
  constructor(
    private readonly sandbox: SandboxService
  ) { }

  async build(source: PLSourceFile): Promise<ResourceLayout> {
    const output = await this.sandbox.build({
      files: source.dependencies.map(dep => ({
        path: dep.alias || basename(dep.abspath),
        content: dep.content
      })),
      variables: source.variables
    });

    this.render(output.variables);

    return this.buildLayout(source.type, output);
  }

  async evaluate(envid: string, answers: Record<string, unknown>): Promise<ResourceLayout> {
    const output = await this.sandbox.evaluate({
      envid,
      variables: answers
    });

    this.render(output.variables);

    return this.buildLayout('exercise', output);
  }

  private render(variables: Record<string, unknown>) {
    nunjucks.configure({
      autoescape: false,
    });
    for (const k in variables) {
      if (typeof variables[k] === 'string') {
        variables[k] = nunjucks.renderString(variables[k] as string, variables);
      }
    }
  }

  private buildLayout(type: PLSourceFileTypes, output: SandboxResponse): ResourceLayout {
    const build = {
      exercise: () => {
        return {
          type: 'exercise',
          title: output.variables.title,
          form: output.variables.form,
          statement: output.variables.statement,
          envid: output.envid,
        } as ExerciseLayout;
      },
      activity: () => {
        return {
          type: 'activity',
          intro: output.variables.intro,
          title: output.variables.title,
          envid: output.envid,
          navigation: [],
        } as ActivityLayout;
      },
    }[type];

    return build();
  }
}
