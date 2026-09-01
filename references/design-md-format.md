# The DESIGN.md contract format

The convention this skill reads and writes: one `DESIGN.md` at the repo root
(`docs/DESIGN.md` honored as fallback) plus W3C DTCG tokens at
`design/tokens.json`. Both are derivable from Northlit and both are diffable
in review.

## Format

`DESIGN.md` follows the `google-labs-code/design.md` spec, which Northlit
emits natively via `render_design_md`:

```markdown
---
name: Acme
version: alpha
description: One line on the design's intent.
colors:
  primary: "#0B7285"      # required — every other color is optional.
  surface: "#FAFBFC"      # ALWAYS quote hex values: an unquoted # starts
                          # a YAML comment and the value silently vanishes.
typography:               # at least one entry; each entry is a map
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: 32px
    fontWeight: 700       # number or string
    lineHeight: 1.1
rounded:                  # optional scales
  card: 8px
spacing:
  gutter: 24px
components:               # optional; each component is a map of props
  button:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.card}"
    padding: "{spacing.gutter}"
---

# Acme

## Overview
## Colors
## Typography
## Layout
## Elevation & Depth
## Shapes
## Components
## Do's and Don'ts
```

Two layers, two jobs:

- **Frontmatter tokens** carry the mechanics — exact values a build can be
  checked against.
- **Prose sections** carry the judgment — voice, composition, anti-patterns,
  the things a stylesheet can't say.

## Token references

A component prop whose **entire value** is `{colors.x}` / `{typography.x}` /
`{rounded.x}` / `{spacing.x}` must resolve to a frontmatter key;
unresolvable references are defects. A ref embedded inside a longer string
is not validated — write refs as whole values. Spec component props:
`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`,
`height`, `width` (others are stripped by renderers). Check with:

```bash
node scripts/validate-design-md.mjs DESIGN.md
```

The validator is standalone, dependency-free, and offline — safe to run in
CI with no Northlit account.

## Provenance

When this skill writes or refreshes a DESIGN.md, it appends:

```html
<!-- generated with Northlit · run <runId> · direction <directionId> · YYYY-MM-DD -->
```

so the file's origin is auditable and regeneration is reproducible.
