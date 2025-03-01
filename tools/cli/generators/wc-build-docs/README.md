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
   - Frontmatter with the component title and description
   - Component name as a heading with styled selector
   - Component description
   - Original markdown documentation
   - Interactive property display using React components
   - Raw JSON schema in a separate tab

## MDX Format & Features

Each generated MDX file includes:

- Frontmatter with title and description
- Clear component name and selector display
- Original documentation from .md files
- Interactive property explorer with expandable nested properties
- Tab-based view switching between interactive and raw schema views

The interactive property display allows users to:

- See property descriptions, types, and default values
- Expand nested object and array properties
- Toggle between a user-friendly view and raw JSON

## Integrating with Nextra

The generated documentation is designed to work with Nextra, using:

- Nextra's Tab component for switching views
- React components for interactive displays
- Proper metadata for navigation and search
