# northlit-design-skill

An open-source agent skill that teaches your AI agent — Claude Code, Codex,
Cursor, or anything that can load a markdown file — to create beautifully
designed, on-brand pages with [Northlit](https://northlit.ai), governed by
your brand and your repo's `DESIGN.md`.

The skill teaches one loop:

> **gather the design contract → generate under it → build → verify
> adherence → write the contract back → hand off**

Northlit is the design engine (explorations of divergent direction mocks,
working HTML prototypes, design-system export). The skill is the judgment
layer: it makes the agent read your design contract before generating,
verify the output against it mechanically, and keep the contract current in
your repo — so every future agent, in every harness, inherits your design
decisions.

## Why use it

**Coding agents one-shot UI into the same generic look.** Ask five agents
for a landing page and you get five variations of the same cream hero,
gradient button, and centered card grid. Design context alone measurably
helps — Vercel's matched tests of their
[design.md](https://vercel.com/blog/how-our-agents-build-on-brand-pages-with-design-md)
showed 57% fewer deterministic design failures — and this skill goes
further than context in three ways:

- **Exploration before code.** Instead of prompt-roulette on generated
  code, the skill runs one Northlit exploration and puts genuinely
  divergent direction mocks side by side — cheap images, minutes, on a
  shareable board. You choose a direction with your eyes, then commit to a
  build.
- **Verification instead of vibes.** "On-brand" becomes checkable: every
  token reference must resolve, exported tokens are diffed against your
  repo's, and each divergence is classified as drift (gets fixed) or
  evolution (gets documented). The agent reports what it checked, not what
  it hopes.
- **A contract that compounds.** The loop ends by writing `DESIGN.md` and
  `design/tokens.json` back to your repo as a proposed change. From then
  on, every agent in every harness inherits your design decisions — and the
  bundled validator keeps the file honest in CI.

**It slots into the process you already have.** Northlit sits upstream as
the design brain; your coding agent stays the implementer, handed a
`BUILD.md` with exact tokens, reference imagery, and precedence rules.
Design tokens export as W3C DTCG for Figma Variables, Tokens Studio, or
Style Dictionary; prototypes publish to a URL for stakeholder review.
Nothing about your build pipeline changes.

**What you get at the end** is four artifacts, not one: the explored
options you chose from, a working prototype, an auditable design contract
living in your repo, and a machine-readable implementation spec for
whatever builds the real thing.

## What's in the package

```
SKILL.md                          the skill — judgment + sequence
references/
  design-md-format.md             the DESIGN.md contract format
  verification.md                 the adherence-check protocol
  no-account.md                   what works without a Northlit account
scripts/
  validate-design-md.mjs          standalone DESIGN.md validator (no deps)
examples/
  acme.design.md                  a minimal valid DESIGN.md
```

## Install

**Claude Code** — copy the folder into your project or home skills
directory:

```bash
git clone https://github.com/3-Elements-Design/northlit-design-skill .claude/skills/northlit-design
```

(or `~/.claude/skills/northlit-design` to have it in every project). Then
connect the Northlit MCP server — OAuth runs in your browser on first use,
no key handling needed:

```bash
claude mcp add --transport http northlit https://northlit.ai/api/mcp
```

**Codex** — place the folder in your Codex skills directory the same way,
and connect the same MCP server if your setup supports HTTP MCP servers.

**Cursor / other agents** — no skill loader needed. Add the raw
[`SKILL.md`](SKILL.md) to your rules/system context, create an API key at
[northlit.ai/settings/api](https://northlit.ai/settings/api), and export it:

```bash
export NORTHLIT_API_KEY=da_...
```

The skill's REST lane starts from the live, public
[API reference](https://northlit.ai/api-reference.md) — it never relies on
memorized endpoints.

## Do I need a Northlit account?

**No** for the contract half: authoring a `DESIGN.md`, validating it, and
enforcing it on pages your agent builds by hand all work offline. **Yes**
for the generative half (explorations, prototype builds, exports) — the
skill checks your plan first and relays the signup link if you don't have
one, instead of dead-ending.

You also don't need an existing Northlit project, brand, or board — a plain
brief works from zero. If you *do* have a brand, saved design systems, or a
repo `DESIGN.md`, the skill reads them first and resolves conflicts by an
explicit precedence ladder (your words → locked brand → repo DESIGN.md →
saved systems → agent taste).

## The validator

Dependency-free, offline, CI-safe:

```bash
node scripts/validate-design-md.mjs DESIGN.md            # errors + warnings
node scripts/validate-design-md.mjs DESIGN.md --strict   # warnings fail too
```

It checks what the [`google-labs-code/design.md`](https://github.com/google-labs-code/design.md)
format requires (a `name`, a `colors.primary`, at least one typography
token), that every `{colors.x}`-style token reference in `components`
resolves, and that section order follows the spec — plus friendly warnings
for the classic traps (unquoted hex values, non-spec component props).
See [references/design-md-format.md](references/design-md-format.md) for
the format.

Try it: `node scripts/validate-design-md.mjs examples/acme.design.md`

## License

MIT © 3 Elements Design
