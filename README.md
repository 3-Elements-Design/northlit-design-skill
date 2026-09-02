# northlit-design-skill

**Every AI-built page looks the same. Give your agent taste.**

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

## Who it's for

- **Designers** — your design system stops being a PDF nobody opens. It
  becomes a contract every agent obeys, with your tokens flowing to Figma,
  Tokens Studio, or Style Dictionary untouched.
- **UX engineers** — compare six directions before a single line of code
  exists, hand off a `BUILD.md` with exact tokens and reference imagery,
  and keep drift out with a CI validator that runs anywhere.
- **Developers** — ask for "a pricing page that matches our brand" and get
  one. Verified, not vibed. No design-review ping-pong.

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

## One prompt, any agent

Paste this into whatever agent you use — Claude Code, Codex, ChatGPT, Cursor,
VS Code — and it connects Northlit the right way for itself, installs this
skill, and confirms the connection:

```text
Set up Northlit for me in this environment and confirm it works. Northlit is an AI design studio (boards of design-direction mocks, working HTML prototypes, images, video) exposed as an MCP server.

1. Connect the Northlit MCP server — remote HTTP at https://northlit.ai/api/mcp, OAuth 2.1 with dynamic client registration (a browser sign-in; no keys to paste). Use the route for the agent you are:
   - Claude Code: run `claude mcp add --transport http northlit https://northlit.ai/api/mcp` — or install the plugin with `/plugin marketplace add 3-Elements-Design/northlit-claude-plugin` then `/plugin install northlit@northlit`.
   - Codex CLI: run `codex plugin marketplace add 3-Elements-Design/northlit-codex`, then install Northlit from `/plugins` (or `codex mcp add northlit --url https://northlit.ai/api/mcp` then `codex mcp login northlit`).
   - ChatGPT: open Plugins, search "Northlit" and install it (or Plugins → + New Plugin with the server URL https://northlit.ai/api/mcp).
   - Cursor, VS Code, Windsurf, Gemini CLI or any other MCP client: add an HTTP MCP server named `northlit` with the URL https://northlit.ai/api/mcp. If the client cannot do OAuth, create an API key at https://northlit.ai/settings/api and send it as `Authorization: Bearer <key>`.
2. Install the northlit-design skill so design work follows my brand and my repo's DESIGN.md: clone https://github.com/3-Elements-Design/northlit-design-skill into your skills directory (Claude Code: `.claude/skills/northlit-design`; other agents: load its SKILL.md as context).
3. Verify: call the `whoami` tool (my plan and credits) and `getting_started`, then tell me what you found and how to start my first exploration. If I have no Northlit account yet, point me to https://northlit.ai — new accounts start with free credits.
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
