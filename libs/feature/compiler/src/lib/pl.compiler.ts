/* eslint-disable @typescript-eslint/no-explicit-any */
import { deepMerge, resolveFileReference } from '@platon/core/common'
import { v4 as uuidv4 } from 'uuid'
import {
  AssignmentNode,
  CommentNode,
  ExtendsNode,
  IncludeNode,
  PLDict,
  PLFileContent,
  PLFileURL,
  PLNode,
  PLParser,
  PLReference,
  PLSourceFile,
  PLVisitor,
} from './pl.parser'
import { ActivityVariables, ExerciseVariables, Variables } from './pl.variables'

/**
 * File reference resolver for the PL compiler.
 * This interface is used to abstract the resolving the files so each plateform (browser, server) can use the PL compiler.
 */
export interface PLReferenceResolver {
  /**
   * Gets the download url of the file at `path` from the given `version` of `resource`.
   * @param resource Resource id of code.
   * @param version Version of the resource.
   * @param path Path to resolves.
   */
  resolveUrl(resource: string, version: string, path: string): Promise<string>
  /**
   * Gets the cotnent url of the file at `path` from the given `version` of `resource`.
   * @param resource Resource id of code.
   * @param version Version of the resource.
   * @param path Path to resolves.
   */
  resolveContent(resource: string, version: string, path: string): Promise<string>
}

/**
 * Compiles a PL AST to a PLSourceFile.
 */
export class PLCompiler implements PLVisitor {
  private readonly urls = new Map<string, string>()
  private readonly contents = new Map<string, string>()
  private readonly resolver: PLReferenceResolver
  private readonly source: PLSourceFile
  private lineno = 0

  constructor(options: { resource: string; version: string; main: string; resolver: PLReferenceResolver }) {
    this.resolver = options.resolver
    this.source = {
      resource: options.resource,
      version: options.version,
      abspath: `${options.resource}:${options.version}/${options.main}`,
      errors: [],
      warnings: [],
      variables: {},
      dependencies: [],
    }
  }

  async visit(nodes: PLNode[]): Promise<PLSourceFile> {
    // should not use Promise.all() since references should be resolved in sync.
    for (const node of nodes) {
      await node.accept(this)
    }
    return this.source
  }

  async visitExtends(node: ExtendsNode | PLDict, merge: boolean): Promise<PLSourceFile> {
    this.lineno = node.lineno
    const { resource, version, relpath } = this.resolveReference('path' in node ? node.path : node.value)

    const content = await this.resolver.resolveContent(resource, version, relpath)
    const compiler = new PLCompiler({
      resource,
      version,
      main: relpath,
      resolver: this.resolver,
    })

    const source = await compiler.compileExercise(content)

    this.source.variables = deepMerge(this.source.variables, source.variables)
    this.source.errors = this.source.errors.concat(source.errors)
    this.source.warnings = this.source.warnings.concat(source.warnings)

    source.dependencies.forEach((a) => {
      if (!this.source.dependencies.find((b) => b.abspath === a.abspath)) {
        this.source.dependencies.push(a)
      }
    })

    if (merge) {
      this.source.variables = deepMerge(this.source.variables, source.variables)
    }

    return source
  }

  async visitInclude(node: IncludeNode): Promise<void> {
    this.lineno = node.lineno

    const { resource, version, relpath, abspath, alias } = this.resolveReference(node.path)
    const content = await this.resolver.resolveContent(resource, version, relpath)

    this.source.dependencies.push({
      alias,
      abspath,
      content,
      lineno: this.lineno,
    })

    return Promise.resolve()
  }

  async visitComment(node: CommentNode): Promise<void> {
    this.lineno = node.lineno
    // TODO link comment to variable doc's
    return Promise.resolve()
  }

  async visitCopyUrl(node: PLFileURL): Promise<string> {
    this.lineno = node.lineno
    return this.resolveUrl(node.value)
  }

  async visitReference(node: PLReference): Promise<any> {
    const [prop, object] = this.withVariable(node.value, true)
    if (prop && object) return object[prop]
    return undefined
  }

  async visitCopyContent(node: PLFileContent): Promise<string> {
    return this.resolveContent(node.value)
  }

  async visitAssignment(node: AssignmentNode): Promise<void> {
    this.lineno = node.lineno

    const [id, obj] = this.withVariable(node.key)
    if (!id || !obj) return Promise.resolve()

    obj[id] = await node.value.toJSON(this)

    return Promise.resolve()
  }

  async compileExercise(content: string, overrides?: Variables): Promise<PLSourceFile> {
    const nodes = await new PLParser().parse(content)
    const source = await this.visit(nodes)
    if (overrides) {
      source.variables = deepMerge(source.variables, await this.withResolvePathInOverrides(overrides))
    }
    return source
  }

  async compileActivity(content: string): Promise<PLSourceFile> {
    const variables = JSON.parse(content) as ActivityVariables

    const [introduction, conclusion] = await Promise.all([
      this.withResolvePath(variables.introduction),
      this.withResolvePath(variables.conclusion),
    ])

    variables.introduction = introduction || ''
    variables.conclusion = conclusion || ''

    // TODO validation + typechecking
    const groups = variables.exerciseGroups
    const exercises: any[] = []
    Object.keys(groups).forEach((groupName) => {
      groups[groupName].forEach((exercise: any) => {
        exercises.push(exercise)
      })
    })

    await Promise.all(
      exercises.map(async (exercise: ExerciseVariables) => {
        const content = await this.resolver.resolveContent(exercise.resource, exercise.version, 'main.ple')
        const compiler = new PLCompiler({
          resource: exercise.resource,
          version: exercise.version,
          main: 'main.ple',
          resolver: this.resolver,
        })
        exercise.id = uuidv4()
        exercise.source = await compiler.compileExercise(content)
        if (exercise.overrides) {
          exercise.source.variables = deepMerge(
            exercise.source.variables,
            await this.withResolvePathInOverrides(exercise.overrides)
          )
        }
      })
    )

    this.source.variables = variables
    return this.source
  }

  private error(description: string) {
    this.source.errors.push({
      description,
      lineno: this.lineno,
      abspath: this.source.abspath,
    })
  }

  private warning(description: string) {
    this.source.warnings.push({
      description,
      lineno: this.lineno,
      abspath: this.source.abspath,
    })
  }

  private withVariable(name: string, required = false): [string | null, Record<string, unknown> | null] {
    const props = name.split('.')
    if (props.find((prop) => !prop)) {
      this.error(`SyntaxError: ${name}`)
      return [null, null]
    }

    const stack: string[] = []

    let parent = this.source.variables
    for (const prop of props.slice(0, -1)) {
      stack.push(prop)

      const value = parent[prop]
      if (value == null && required) {
        this.error(`MissingVariable: ${stack.join('.')}`)
        return [null, null]
      }

      parent[prop] = value ?? {}
      parent = parent[prop] as unknown as Record<string, unknown>
    }

    const prop = props[props.length - 1]
    if (required && !parent[prop]) {
      this.error(`MissingVariable: ${prop}`)
      return [null, null]
    }

    return [props[props.length - 1], parent]
  }

  private withResolvePath(content?: string): Promise<string | undefined> {
    if (!content) return Promise.resolve(content)

    if (content.startsWith('@copyurl')) {
      return this.resolveUrl(content.replace('@copyurl', '').trim())
    }
    if (content.startsWith('@copycontent')) {
      return this.resolveContent(content.replace('@copycontent', '').trim())
    }
    return Promise.resolve(content)
  }

  private resolveReference(path: string) {
    return resolveFileReference(path, this.source)
  }

  private async resolveUrl(path: string) {
    const { resource, version, relpath, abspath } = this.resolveReference(path)
    const cache = this.urls.get(abspath)
    if (cache) {
      return cache
    }
    const url = await this.resolver.resolveUrl(resource, version, relpath)
    this.urls.set(abspath, url)
    return url
  }

  private async resolveContent(path: string) {
    const { resource, version, relpath, abspath } = this.resolveReference(path)
    const cache = this.contents.get(abspath)
    if (cache) {
      return cache
    }
    const content = await this.resolver.resolveContent(resource, version, relpath)
    this.contents.set(abspath, content)
    return content
  }

  private async withResolvePathInOverrides(overrides: Variables): Promise<any> {
    const keys = Object.keys(overrides)
    const promises = keys.map(async (key) => {
      let value = overrides[key]
      if (typeof value === 'string') {
        value = await this.withResolvePath(value)
      }
      return { key, value }
    })

    const results = await Promise.all(promises)
    return results.reduce((acc, { key, value }) => {
      acc[key] = value
      return acc
    }, {} as any)
  }
}
