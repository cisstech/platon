/* eslint-disable @typescript-eslint/no-explicit-any */
import { deepCopy, deepMerge, resolveFileReference } from '@platon/core/common'
import { v4 as uuidv4 } from 'uuid'
import { PleConfigJSON } from './pl.config'
import { PLGenerator } from './pl.generator'
import {
  AssignmentNode,
  CommentNode,
  ExtendsNode,
  IncludeNode,
  PLAst,
  PLDict,
  PLFileContent,
  PLFileURL,
  PLParser,
  PLReference,
  PLSourceFile,
  PLVisitor,
} from './pl.parser'
import { ActivityExercise, ActivityVariables, Variables } from './pl.variables'
import * as crypto from 'crypto-js'

export const ACTIVITY_MAIN_FILE = 'main.pla'
export const EXERCISE_MAIN_FILE = 'main.ple'
export const EXERCISE_CONFIG_FILE = 'main.plc'
export const TEMPLATE_OVERRIDE_FILE = 'main.plo'
export const ACTIVITY_FILE_EXTENSION = '.pla'
export const EXERCISE_FILE_EXTENSION = '.ple'
export const EXERCISE_CONFIG_FILE_EXTENSION = '.plc'
export const TEMPLATE_OVERRIDE_FILE_EXTENSION = '.plo'
export const ACTIVITY_NEXT_FILE_PYTHON = 'next.py'
export const ACTIVITY_NEXT_FILE_NODE = 'next.js'

/**
 * File reference resolver for the PL compiler.
 * This interface is used to abstract the resolving the files so each plateform (browser, server) can use the PL compiler.
 */
export interface PLReferenceResolver {
  /**
   * Tells if the file at `path` exists in the given `version` of `resource`.
   * @param resource Resource on which to check the file.
   * @param version Version of the resource.
   * @param path Path to check.
   */
  exists(resource: string, version: string, path: string): Promise<boolean>

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

interface PLCompilerOptions {
  resource: string
  version: string
  main: string
  resolver: PLReferenceResolver
  withAst?: boolean
}

interface ToExerciseOptions {
  variableChanges: Variables
  includeChanges?: string[]
}

const emptySource = (resource: string, version: string, main: string): PLSourceFile => ({
  resource: resource,
  version: version,
  abspath: `${resource}:${version}/${main}`,
  errors: [],
  warnings: [],
  variables: {},
  ast: {
    nodes: [],
    variables: {},
  },
  dependencies: [],
})

/**
 * Compiles a PL AST to a PLSourceFile.
 */
export class PLCompiler implements PLVisitor {
  private readonly urls = new Map<string, string>()
  private readonly contents = new Map<string, string>()
  private readonly resolver: PLReferenceResolver
  private parent?: PLCompiler
  private nodes: PLAst = []
  private lineno = 0
  private withAst?: boolean
  private config?: PleConfigJSON
  private overrides?: Variables
  private source: PLSourceFile

  get ast(): PLAst {
    return this.nodes.slice()
  }

  constructor(options: PLCompilerOptions) {
    this.resolver = options.resolver
    this.withAst = options.withAst
    this.source = emptySource(options.resource, options.version, options.main)
  }

  /**
   * Returns the output PLSourceFile after applying any overrides.
   * @remarks
   * - This will not computes the original source file but returns a copy of it with the overrides applied, so it can be called multiple times with different overrides.
   * - If there is any template overrides, they will be applied at this step.
   * @param overrides - Optional overrides to apply to the source file.
   * @returns A Promise that resolves to the modified PLSourceFile.
   */
  async output(overrides?: Variables): Promise<PLSourceFile> {
    const source = deepCopy(this.source)
    if (!this.config) {
      return source
    }

    // First, apply the overrides from the config file.
    // Making sure that the overrides have the priority but setting last argument to true.
    // So object and array types are not merged but replaced by the overrides.
    let configOverrides: Variables = {}
    this.config.inputs.forEach((input) => {
      if (input.value != null) {
        configOverrides[input.name] = input.value
      }
    })

    // Then, if the compiler is called with overrides, they have the priority.
    // This is the case for exercice created from a template
    // Here, we know that the template is already compiled thanks to the extends operator.
    if (this.overrides) {
      overrides = deepMerge(this.overrides, overrides || {}, true)
      const templateOverrides: Variables = {}
      this.config.inputs.forEach((input) => {
        if (input.name in overrides! && overrides![input.name] != null) {
          templateOverrides[input.name] = overrides![input.name]
        }
      })
      source.variables = deepMerge(source.variables, await this.resolvePathsInObject(templateOverrides), true)
    } else {
      if (overrides) {
        configOverrides = deepMerge(configOverrides, overrides, true)
      }
      source.variables = deepMerge(source.variables, await this.resolvePathsInObject(configOverrides), true)
    }

    return source
  }

  /**
   * Compiles back the current source file to an exercise raw source file.
   * @param input - The options for converting to an exercise.
   * @returns The generated exercise string.
   */
  toExercise(input: ToExerciseOptions): string {
    return new PLGenerator({
      variableChanges: input.variableChanges,
      includeChanges: input.includeChanges,
      nodes: this.nodes,
      source: this.source,
    }).generate()
  }

  /**
   * Compiles the given content.
   * If the source file has a '.pla' extension, it compiles it as an activity.
   * Otherwise, it compiles it as an exercise.
   * @remarks
   * - To get the compiled source file, call the `output()` method of the compiler.
   * @param content - The content to be compiled.
   * @returns A Promise that resolves when the compilation is complete.
   */
  compile(content: string): Promise<void> {
    return this.source.abspath.endsWith(ACTIVITY_FILE_EXTENSION)
      ? this.compileActivity(content)
      : this.compileExercise(content)
  }

  async visit(ast: PLAst): Promise<PLSourceFile> {
    // should not use Promise.all() since references should be resolved in sync.
    for (const node of ast) {
      node.origin = this.source.abspath
      await node.accept(this)
    }
    this.nodes = ast
    if (this.withAst) {
      this.source.ast.nodes = ast.slice()
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

    await compiler.compileExercise(content)
    const source = await compiler.output()

    this.source.errors = this.source.errors.concat(source.errors)
    this.source.warnings = this.source.warnings.concat(source.warnings)

    source.dependencies.forEach((a) => {
      if (!this.source.dependencies.find((b) => b.abspath === a.abspath)) {
        this.source.dependencies.push(a)
      }
    })

    if (merge) {
      this.source.variables = deepMerge(this.source.variables, source.variables)
      this.parent = compiler
    }

    return source
  }

  async visitInclude(node: IncludeNode): Promise<void> {
    this.lineno = node.lineno

    const { resource, version, relpath, abspath, alias } = this.resolveReference(node.path)
    const content = await this.resolver.resolveContent(resource, version, relpath)
    const hash = crypto.SHA1(content).toString()

    this.source.dependencies.push({
      alias,
      abspath,
      content: '', // TODO: remove content from dependencies
      hash,
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
    const [prop, object] = this.upsertVariable(this.source.variables, node.value, true)
    if (prop && object) return object[prop]
    return undefined
  }

  async visitCopyContent(node: PLFileContent): Promise<string> {
    return this.resolveContent(node.value)
  }

  async visitAssignment(node: AssignmentNode): Promise<void> {
    this.lineno = node.lineno
    const [prop, parent] = this.upsertVariable(this.source.variables, node.key)
    if (!prop || !parent) return Promise.resolve()
    parent[prop] = await node.value.toObject(this)

    if (this.withAst) {
      const [rawProp, rawParent] = this.upsertVariable(this.source.ast.variables, node.key)
      if (rawProp && rawParent) {
        rawParent[rawProp] = node.value.toRaw()
      }
    }

    return Promise.resolve()
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

  /**
   * Compiles the current source file as an exercise.
   * @remarks
   * - The compiler assumes that the given content is a valid PL exercise.
   * - If the exercise extends another, the extends operator is resolved first and it's compiler will be stored in the parent field of the current compiler.
   * - If the exercise is configurable (there is a `main.plc` next to the source file), the compiler will try merge the variables from the config file into the source file.
   * - At the end of the compilation, the compiler will have the following fields:
   *  - `source`: The compiled source file.
   *  - `config`: The `main.plc` file as a JSON object if it exists next to the source file.
   *  - `overrides`: The `main.plo` file as a JSON object if it exists next to the source file.
   *  - To get the compiled source file, call the `output()` method of the compiler.
   * @param content The content of the exercise.
   * @returns A Promise that resolves to void.
   */
  private async compileExercise(content: string): Promise<void> {
    const { resource, version } = this.source

    const [configurable, isFromTemplate] = await Promise.all([
      this.resolver.exists(resource, version, EXERCISE_CONFIG_FILE),
      await this.resolver.exists(resource, version, TEMPLATE_OVERRIDE_FILE),
    ])

    const nodes = new PLParser().parse(content)
    const source = await this.visit(nodes)

    const readConfig = async () => {
      if (!configurable && !isFromTemplate) return undefined

      if (isFromTemplate && !this.parent) {
        this.error(`Compiler: missing extends in resource: ${resource}:${version}`)
      }

      let config: PleConfigJSON | undefined
      try {
        config = isFromTemplate
          ? this.parent?.config
          : JSON.parse(await this.resolveContent(`/${resource}:${version}/${EXERCISE_CONFIG_FILE}`))
      } catch (error: any) {
        this.error(`Compiler: invalid config file in resource: ${resource}:${version} : ` + error.message)
      }

      return config
    }

    const readOverrides = async () => {
      if (!isFromTemplate) return undefined
      let overrides: Variables | undefined
      try {
        overrides = JSON.parse(await this.resolveContent(`/${resource}:${version}/${TEMPLATE_OVERRIDE_FILE}`))
      } catch {
        this.warning(`Compiler: invalid override file in resource: ${resource}:${version}`)
      }
      return overrides
    }

    const [config, overrides] = await Promise.all([readConfig(), readOverrides()])

    this.config = config
    this.source = source
    this.overrides = overrides
  }

  private async compileActivity(content: string): Promise<void> {
    const variables = JSON.parse(content) as ActivityVariables
    const groups = variables.exerciseGroups
    const exercises: ActivityExercise[] = []

    const [introduction, conclusion] = await Promise.all([
      this.resolvePathInString(variables.introduction),
      this.resolvePathInString(variables.conclusion),
    ])

    variables.introduction = introduction || ''
    variables.conclusion = conclusion || ''

    Object.keys(groups).forEach((groupName) => {
      groups[groupName].exercises.forEach((exercise) => {
        exercises.push(exercise)
      })
    })

    // Parallel compile once all unique exercises
    const compilers: Record<string, PLCompiler> = {}
    await Promise.all(
      exercises.map(async (exercise) => {
        const { resource, version } = exercise
        const key = `${resource}:${version}`
        if (!(key in compilers)) {
          const compiler = (compilers[key] = new PLCompiler({
            resource,
            version,
            main: EXERCISE_MAIN_FILE,
            resolver: this.resolver,
          }))
          await compiler.compileExercise(await this.resolver.resolveContent(resource, version, EXERCISE_MAIN_FILE))
        }
      })
    )

    await Promise.all(
      exercises.map(async (exercise) => {
        exercise.id = uuidv4()
        exercise.source = await compilers[`${exercise.resource}:${exercise.version}`].output(exercise.overrides)
        this.replaceComponentsCids(exercise.source.variables)
      })
    )

    if (variables.settings?.navigation?.mode === 'next') {
      const file =
        variables.settings.nextSettings?.sandbox === 'python' ? ACTIVITY_NEXT_FILE_PYTHON : ACTIVITY_NEXT_FILE_NODE
      const next = await this.resolveContent(file)
      variables.next = next
    }

    this.source.variables = variables
  }

  private replaceComponentsCids(obj: object): void {
    const replaceCidRecursively = (obj: any): void => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (key == 'cid' && Object.prototype.hasOwnProperty.call(obj, 'selector')) {
            obj[key] = uuidv4()
          }
          const value = obj[key]
          if (value && typeof value === 'object') {
            replaceCidRecursively(value)
          }
        }
      }
    }

    replaceCidRecursively(obj)
  }

  /**
   * Upserts a variable in the given Variables object.
   *
   * @param variables - The Variables object to update.
   * @param name - The name of the variable to upsert.
   * @param required - Indicates whether to raise an error if object path to the variable does not exist in the Variables object.
   * @returns A tuple containing the name of the variable and the updated Variables object, or null if there was an error.
   */
  private upsertVariable(variables: Variables, name: string, required = false): [string | null, Variables | null] {
    const props = name.split('.')
    if (props.find((prop) => !prop)) {
      this.error(`SyntaxError: ${name}`)
      return [null, null]
    }

    const stack: string[] = []

    let parent = variables
    for (const prop of props.slice(0, -1)) {
      stack.push(prop)

      const value = parent[prop]
      if (value == null && required) {
        this.error(`MissingVariable: ${stack.join('.')}`)
        return [null, null]
      }

      parent[prop] = value ?? {}
      parent = parent[prop] as unknown as Variables
    }

    const prop = props[props.length - 1]
    if (required && !parent[prop]) {
      this.error(`MissingVariable: ${prop}`)
      return [null, null]
    }

    return [props[props.length - 1], parent]
  }

  /**
   * Resolves a file reference path.
   * @remarks
   * - The reference is resolved relative to the current source file.
   *
   * @param path - The path of the file reference.
   * @returns The resolved file reference.
   */
  private resolveReference(path: string) {
    return resolveFileReference(path, this.source)
  }

  /**
   * Resolves the url of a given path first from the compiler cache, then from the file resolver.
   * @remarks
   * - The resolved url is cached in the compiler.
   * @param path - The path to resolve.
   * @returns The resolved url.
   */
  private async resolveUrl(path: string): Promise<string> {
    const { resource, version, relpath, abspath } = this.resolveReference(path)
    const cache = this.urls.get(abspath)
    if (cache) {
      return cache
    }
    const url = await this.resolver.resolveUrl(resource, version, relpath)
    this.urls.set(abspath, url)
    return url
  }

  /**
   * Resolves the content of a given path first from the compiler cache, then from the file resolver.
   * @remarks
   * - The resolved content is cached in the compiler.
   * @param path - The path to resolve.
   * @returns The resolved content.
   */
  private async resolveContent(path: string): Promise<string> {
    const { resource, version, relpath, abspath } = this.resolveReference(path)
    const cache = this.contents.get(abspath)
    if (cache) {
      return cache
    }
    const content = await this.resolver.resolveContent(resource, version, relpath)
    this.contents.set(abspath, content)
    return content
  }

  private async resolvePathInString(content?: string): Promise<string | undefined> {
    if (!content) return Promise.resolve(content)

    content = content.trim()
    if (content.startsWith('@copyurl')) {
      return this.resolveUrl(content.replace('@copyurl', ''))
    }
    if (content.startsWith('@copycontent')) {
      return this.resolveContent(content.replace('@copycontent', ''))
    }
    return Promise.resolve(content)
  }

  /**
   * Recursively resolves all path references in strings of the given object/array.
   * @remarks
   * - Paths are the one used in the PL syntax: `@copyurl` and `@copycontent`.
   * @param obj Object or array to resolve.
   * @returns A promise that resolves to the object/array with all paths resolved.
   */
  private async resolvePathsInObject(obj: any): Promise<any> {
    if (typeof obj === 'string') {
      return this.resolvePathInString(obj)
    } else if (Array.isArray(obj)) {
      return Promise.all(
        obj.map((v) => {
          return this.resolvePathsInObject(v)
        })
      )
    } else if (typeof obj === 'object') {
      const keys = Object.keys(obj)
      const promises = keys.map(async (key) => {
        return { key, value: await this.resolvePathsInObject(obj[key]) }
      })
      const results = await Promise.all(promises)
      return results.reduce((acc, { key, value }) => {
        acc[key] = value
        return acc
      }, {} as any)
    }
    return obj
  }
}
