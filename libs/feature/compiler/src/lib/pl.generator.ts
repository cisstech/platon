import {
  AssignmentNode,
  CommentNode,
  ExtendsNode,
  IncludeNode,
  PLAst,
  PLNode,
  PLObject,
  PLSourceFile,
  PLValue,
} from './pl.parser'
import { Variables } from './pl.variables'

export const convertObjectToDotNotation = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  const transform = (o: Record<string, unknown>, prefix = '') => {
    let component = false
    for (let k in o) {
      if (component && (k === 'cid' || k === 'selector')) {
        continue
      }
      const value = o[k]
      if ((k === 'cid' && 'selector' in o) || (k === 'selector' && 'cid' in o)) {
        result[prefix.trim()] = `:${o['selector']}`
        component = true
      } else {
        k = (prefix ? `${prefix}.${k}` : k).trim()
        if (typeof value === 'object' && !Array.isArray(value)) {
          transform(value as Record<string, unknown>, k)
        } else {
          result[k] = value
        }
      }
    }
  }
  transform(obj)
  return result
}

export const convertPLObjectToDotNotation = (node: AssignmentNode, prefix: string) => {
  const result: AssignmentNode[] = []
  const transform = (record: Record<string, PLValue>, prefix: string) => {
    Object.keys(record).forEach((key) => {
      const item = record[key]
      key = (prefix ? `${prefix}.${key}` : key).trim()
      if (typeof item.value === 'object' && !Array.isArray(item.value)) {
        transform(item.value as Record<string, PLValue>, key)
      } else {
        const assignment = new AssignmentNode(key, item, node.lineno)
        assignment.origin = node.origin
        result.push(assignment)
      }
    })
  }
  transform(node.value.value as Record<string, PLObject>, prefix)
  return result
}

export const findNodeComments = (nodes: PLNode[], node: string | PLNode): CommentNode[] => {
  let index =
    typeof node === 'string'
      ? nodes.findIndex((n) => n instanceof AssignmentNode && n.key === node)
      : nodes.indexOf(node)

  if (index <= 0) {
    return []
  }

  const comments: CommentNode[] = []
  while (index > 0) {
    index--
    const node = nodes[index]
    if (!(node instanceof CommentNode)) {
      break
    }
    comments.push(node)
  }
  return comments
}

export const flattenAssignmentNodes = (nodes: PLAst): AssignmentNode[] => {
  const assignments = nodes.filter((node) => node.type === 'AssignmentNode') as AssignmentNode[]
  const sortedNodes: AssignmentNode[] = []
  const groupedNodes: { [key: string]: AssignmentNode[] } = {}

  for (const node of assignments) {
    const segments = node.key.split('.')
    const variableName = segments[0]

    if (!groupedNodes[variableName]) {
      groupedNodes[variableName] = []
    }
    if (typeof node.value.value === 'object' && !Array.isArray(node.value.value)) {
      groupedNodes[variableName].push(...convertPLObjectToDotNotation(node, variableName))
    } else {
      groupedNodes[variableName].push(node)
    }
  }

  for (const variableName of Object.keys(groupedNodes)) {
    sortedNodes.push(...groupedNodes[variableName])
  }

  return sortedNodes
}

interface PLGeneratorInput {
  readonly nodes: PLNode[]
  readonly changes: Variables
  readonly source: PLSourceFile
}

export class PLGenerator {
  private readonly nodes: PLNode[]
  private readonly changes: Variables
  private readonly source: PLSourceFile

  constructor(input: PLGeneratorInput) {
    this.nodes = input.nodes
    this.changes = input.changes
    this.source = input.source
  }

  generate(): string {
    const ownNodes = this.nodes.filter((node) => node.origin === this.source.abspath)
    return this.format(ownNodes)
  }

  private format(nodes: PLNode[]): string {
    const inherits = nodes.filter((node) => node instanceof ExtendsNode) as ExtendsNode[]
    const includes = nodes.filter((node) => node instanceof IncludeNode) as IncludeNode[]

    const extractNodeComments = (node: string | PLNode) => {
      const comments = findNodeComments(nodes, node)
        .map((comment) => comment.value)
        .join('\n')
      if (!comments) return ''
      return comments.endsWith('\n') ? comments : comments + '\n'
    }

    let code = ''

    inherits.forEach((node) => {
      code += extractNodeComments(node)
      code += `@extends ${node.path}\n`
    })

    includes.forEach((node) => {
      code += extractNodeComments(node)
      code += `@include ${node.path}\n`
    })

    code += '\n'

    const changes = convertObjectToDotNotation(this.changes)
    let currentVariable = ''
    Object.keys(changes).forEach((key) => {
      currentVariable = currentVariable || key.split('.')[0]
      const newVariable = key.split('.')[0]
      if (currentVariable !== newVariable) {
        currentVariable = newVariable
        code += '\n'
      }

      code += extractNodeComments(key)
      const value = changes[key]
      switch (typeof value) {
        case 'string':
          if (value.includes('\n')) {
            code += `${key}==${value.startsWith('\n') ? '' : '\n'}${value}${value.endsWith('\n') ? '' : '\n'}==`
          } else {
            code += `${key} = "${value}"`
          }
          break
        case 'number':
          code += `${key} = ${value}`
          break
        case 'boolean':
          code += `${key} = ${value}`
          break
        default:
          code += `${key} = ${JSON.stringify(value, null, 2)}`
          break
      }
      code += '\n'
    })

    code = code.replace(/":wc-([^"]+)"/g, ':wc-$1')
    code = code.replace(/"@copyurl\s+([^"]+)"/g, '@copyurl $1')
    code = code.replace(/"@copycontent\s+([^"]+)"/g, '@copycontent $1')

    return code
  }
}
