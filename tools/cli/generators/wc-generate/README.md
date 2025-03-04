# WebComponent Documentation Generator

This generator generate boilerplate codes of new component and register it in web component registry.

## Usage

```bash
yarn nx g @platon/cli:wc-generate --type=[form]|[widget] --name=<component-name>

```

### Options

- `--type=<form|widget>` - The type of the component.
- `--name=<string>` - The name of the component.

## How it works

The generator generate new directory into [forms](/libs/feature/webcomponent/src/lib/forms) or [widgets](/libs/feature/webcomponent/src/lib/widgets) folder with default template files to code new webcomponent.

Then the generated component will be registered in [web-component-registry](/libs/feature/webcomponent/src/lib/web-component-registry.ts) so that it can be used in the application.
