# Working with the spec

`spec/` is the source of truth for what this product does. It is machine-checked, so it cannot drift from intent. The screens and the code are views of it, not the other way around.

## The layout

- `spec/project.md` + `spec/flows/<flow>.md` - the contract (prose + one `spec:` YAML block each).
- `design.md` - the visual tokens (colors, typography) at the repo root.
- `flows/<flow>/<screen>.<device>[.<state>].html` - the wireframe screens, content-only HTML styled by the design tokens.

## Before you build

Read `spec/project.md` (identity, global rules, flow index) and the relevant `spec/flows/<flow>.md`. Build to the spec, not around it.

## The spec format

- Each flow file is prose (for humans and for you) followed by exactly ONE `spec:` YAML block (the machine truth).
- Rules are always PROSE under `## Rules`, never inside the YAML.
- A flow named in the index with no file yet is a planned flow.

A flow's `spec:` block:

```
spec:
  screens:
    - { id: <id>, states: [default, empty, loading, error] }
    - { id: <id>, states: [default], overlay: true }
  edges:
    - { from: <id>, to: <id>, on: <event> }
```

## Authoring screens

For each screen and state in a flow's spec, write `flows/<flow>/<id>.<device>[.<state>].html`. The default state omits the state segment, so `home.mobile.html` and `home.mobile.empty.html` are two states of one screen. Prefix a file with `NN-` to order it in the canvas: `01-home.mobile.html`.

Each screen is **content-only HTML**, rendered inside an isolated iframe. Write what goes in the body: no `<html>`, no `<head>`, no `<style>` blocks unless a rule truly is local to that screen. The frame sizes are fixed, so compose for them:

| device | viewport |
| --- | --- |
| desktop | 1180 x 760 |
| mobile | 380 x 800 |
| tablet | 840 x 1100 |

### Navigation

Put `data-wf-to="<target-screen-id>"` on whatever the user clicks. The canvas turns it into a live hotspot and draws the edge; a target that does not exist is reported as a dead link. Any `<a href>` is neutralised, so navigation always goes through `data-wf-to`. Forms never submit.

## Styling: what design.md gives you

`design.md` is YAML frontmatter plus prose. The frontmatter compiles to CSS you can rely on:

- `colors: { ink: '#211f1a' }` becomes `var(--color-ink)`.
- `rounded` and `spacing` become `var(--rounded-<key>)` and `var(--spacing-<key>)`.
- `typography: { display: { fontFamily: ... } }` becomes `var(--font-display)` **and** a `.display` class carrying the whole set (size, weight, line height, tracking).
- `components: { btn: { backgroundColor: '{colors.ink}' } }` becomes a `.btn` class. Inside the frontmatter, `{colors.x}` resolves to the matching variable.
- `statusBar` paints the phone chrome around mobile frames.

Use the tokens rather than raw hex in screens: a palette change then lands everywhere at once. For what tokens cannot express (pseudo-elements, layout, a bespoke component), add `design.css` at the root. It is appended after the compiled tokens, so it can use them.

Per flow styling goes in `flows/<flow>/*.css`, loaded only for that flow's screens.

## Icons

Drop SVGs in a folder listed under `icons:` in `wiresmith.yml`. Each `<name>.svg` becomes a sprite symbol, used as:

```html
<svg class="ico"><use href="#name"/></svg>
```

Size the `.ico` class yourself in `design.css`. Stroke icons keep their `fill`, `stroke` and `stroke-width` from the source file, so a feather style set renders as intended.

## The other files in a flow

- `flows/<flow>/meta.yml` - `title`, `description`, and `order` to place the flow in the canvas.
- `flows/<flow>/annotations.yml` - notes shown beside the screens, optionally anchored to one: `- { screen: home, note: ... }`. Use them for design intent, never as text on the mockup itself.

## Product docs

`docs/*.md` is rendered next to the screens in the canvas. This is where the product reasoning lives: who it is for, the job to be done, the states that matter, the rules the design keeps. The spec says what the product does; these say why. Number them to order them (`01-product.md`).

## When a feature changes

Update the spec AND the screens in the same change as the code. Never let the code do something the spec does not describe.

## The commands

- `foundry check` - fails on dangling edges, overlays with no way out, and nav pointing at flows that do not exist. Keep it green; it is the CI gate.
- `foundry serve` - the canvas, live, while you author.
- `foundry build` - the same canvas as a static site you can host.

## Global rules

See `## Rules` in `spec/project.md`. They apply to every flow.
