import { Tree, formatFiles, generateFiles, joinPathFragments, names } from '@nrwl/devkit'
import * as ts from 'typescript'
import { WcGenerateGeneratorSchema } from './schema'

interface NormalizedOptions extends WcGenerateGeneratorSchema {
  classify: string
  componentType: string
  projectRoot: string
}

export default async function (tree: Tree, schema: WcGenerateGeneratorSchema) {
  // Normalize options and set up paths
  const normalizedOptions = normalizeOptions(schema)

  // Generate component files from templates
  generateComponentFiles(tree, normalizedOptions)

  // Update the component registry file
  updateComponentRegistry(tree, normalizedOptions)

  // Format all files
  await formatFiles(tree)

  return tree
}

function normalizeOptions(options: WcGenerateGeneratorSchema): NormalizedOptions {
  const name = names(options.name).fileName
  const type = options.type.toLowerCase()

  const componentType = type === 'form' ? 'forms' : 'widgets'

  return {
    ...options,
    name,
    componentType,
    classify: names(options.name).className,
    projectRoot: 'libs/feature/webcomponent/src/lib',
  }
}

function generateComponentFiles(tree: Tree, options: NormalizedOptions) {
  const { name, componentType, projectRoot } = options
  const targetDirectory = joinPathFragments(projectRoot, componentType, name)

  // Generate files from templates
  generateFiles(tree, joinPathFragments(__dirname, 'templates'), targetDirectory, {
    ...options,
    tmpl: '', // For EJS template processing
    classify: (str: string) => names(str).className,
    name: options.name,
    type: options.type,
  })
}

function updateComponentRegistry(tree: Tree, options: NormalizedOptions) {
  const { name, classify, componentType, projectRoot } = options
  const registryFilePath = joinPathFragments(projectRoot, 'web-component-registry.ts')

  // Read the registry file content
  const registryFileContent = tree.read(registryFilePath)?.toString() || ''

  // Parse the file using TypeScript compiler API
  const sourceFile = ts.createSourceFile(registryFilePath, registryFileContent, ts.ScriptTarget.Latest, true)

  // 1. Add import statement for component definition
  const importStatement = `import { ${classify}ComponentDefinition } from './${componentType}/${name}/${name}'`
  const updatedWithImport = addImportToSourceFile(registryFileContent, sourceFile, importStatement)

  // 2. Add entry to WEB_COMPONENTS_BUNDLES array
  const bundleEntry = createBundleEntry(name, classify, componentType)
  const updatedWithBundle = addEntryToArray(updatedWithImport, 'WEB_COMPONENTS_BUNDLES', bundleEntry)

  // 3. Add entry to WEB_COMPONENTS_REGISTRY array
  const registryEntry = createRegistryEntry(classify)
  const finalContent = addEntryToArray(updatedWithBundle, 'WEB_COMPONENTS_REGISTRY', registryEntry)

  // Write the updated content back to the file
  tree.write(registryFilePath, finalContent)
}

function createBundleEntry(name: string, classify: string, componentType: string): string {
  return `{
    selector: 'wc-${name}',
    module: () =>
      import(/* webpackChunkName: "wc-${name}" */ './${componentType}/${name}/${name}.module').then(
        (m) => m.${classify}Module
      ),
  },`
}

function createRegistryEntry(classify: string): string {
  return `{
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: ${classify}ComponentDefinition,
  },`
}

function addImportToSourceFile(sourceText: string, sourceFile: ts.SourceFile, importStatement: string): string {
  // Extract the component name from import statement
  const componentNameMatch = importStatement.match(/import \{ ([^}]+) \}/)
  const componentName = componentNameMatch ? componentNameMatch[1] : null

  // Check if import already exists
  let importExists = false
  if (componentName) {
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node) && node.importClause && node.importClause.getText().includes(componentName)) {
        importExists = true
      }
    })
  }

  // If import already exists, return the original source text
  if (importExists) {
    return sourceText
  }

  // Find the position after the last import
  let lastImportEnd = 0
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const end = node.getEnd()
      if (end > lastImportEnd) {
        lastImportEnd = end
      }
    }
  })

  // Insert the new import after the last import
  return sourceText.substring(0, lastImportEnd) + '\n' + importStatement + sourceText.substring(lastImportEnd)
}

function addEntryToArray(sourceText: string, arrayName: string, entry: string): string {
  // Parse the source file
  const sourceFile = ts.createSourceFile('temp.ts', sourceText, ts.ScriptTarget.Latest, true)

  // Extract component name from the entry
  const bundleMatch = entry.match(/selector:([^,]+)/)
  const bundleValue = bundleMatch ? bundleMatch[1].trim() : null
  const registryMatch = entry.match(/useValue:\s*([A-Za-z0-9_]+)ComponentDefinition/)
  const registryValue = registryMatch ? registryMatch[1] : null

  let arrayDecl: ts.ArrayLiteralExpression | null = null
  let entryAlreadyExists = false

  // Find the array literal expression
  const findArray = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === arrayName &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      arrayDecl = node.initializer

      // Check if entry already exists
      if (registryValue && arrayDecl) {
        const arrayText = arrayDecl.getText()
        if (arrayText.includes(`${registryValue}ComponentDefinition`)) {
          entryAlreadyExists = true
          console.log(`Entry for '${registryValue}ComponentDefinition' already exists in the registry, skipping...`)
        }
      } else if (bundleValue && arrayDecl) {
        const arrayText = arrayDecl.getText()
        if (arrayText.includes(bundleValue)) {
          entryAlreadyExists = true
          console.log(`Entry for ${bundleValue} already exists in the registry, skipping...`)
        }
      }
      return
    }
    ts.forEachChild(node, findArray)
  }

  ts.forEachChild(sourceFile, findArray)

  // If array doesn't exist or entry already exists, return original source
  if (!arrayDecl || entryAlreadyExists) {
    return sourceText
  }

  const array = arrayDecl as ts.ArrayLiteralExpression
  // Find the position after the opening bracket '['
  const arrayStart = array.getStart()
  const arrayText = sourceText.substring(arrayStart)
  const openBracketPos = arrayStart + arrayText.indexOf('[') + 1

  // Format the entry appropriately
  const formattedEntry = `\n  ${entry}`

  // Insert the entry at the beginning of the array
  return sourceText.substring(0, openBracketPos) + formattedEntry + sourceText.substring(openBracketPos)
}
