# WebComponent Documentation Generator

This generator scans the webcomponent library folders for documentation and component definitions to generate MDX documentation files.

## Usage

```bash
yarn nx workspace-generator wc-build-docs
```

### Options

- `--sourceDir=<path>` - The source directory containing webcomponents (default: 'libs/feature/webcomponent/src/lib')
- `--outputDir=<path>` - The output directory for generated docs (default: 'apps/docs/pages/components')

## How it works

The generator searches for component folders within the forms and widgets directories. For each component found, it:

1. Extracts the component definition from the TypeScript file
2. Reads the markdown documentation file
3. Generates an MDX file with the following structure:
   - Frontmatter with the component title
   - Component name as a heading
   - Component selector
   - Component description
   - Original markdown documentation
   - Component schema as JSON

It also generates other files like index.mdx found from the [documentation](./templates//docs/) folder.

## MDX Format

Each generated MDX file has the following structure:

```mdx
---
title: component name
---

# component name

---

component selector

component description

content from original markdown documentation

json schema from component definition
```

This format provides consistent documentation that includes both the original markdown content and technical details extracted from the component definition.
