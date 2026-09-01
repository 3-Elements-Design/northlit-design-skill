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

Calm, technical, glacial. Pages lead with the claim, then the evidence.
Frontmatter tokens are the mechanics; these prose sections are the judgment.

## Colors

- **primary** (`#0B7285`) — actions, links, and nothing decorative.
- **surface** (`#FAFBFC`) — the only page ground. No invented grays.

## Typography

- **headline** — Bricolage Grotesque 32px/1.1, weight 700. Balance headings;
  never letterspace lowercase.

## Layout

- `gutter` — 24px. One reading column, ~68ch. Wide content scrolls inside
  its own container; the page never scrolls sideways.

## Components

### button

Defined in frontmatter under `components.button`.

## Do's and Don'ts

**Do**

- Take every color and radius from the tokens above.

**Don't**

- Center body text or add gradients — this brand is flat and left-aligned.
