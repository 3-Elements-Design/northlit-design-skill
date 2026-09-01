# Without a Northlit account

No API key — or plan "none" with **zero** credits remaining — lands here.
(Plan "none" with credits remaining is not this case: new accounts start
with one-time welcome credits that billable tools spend without a plan, so
generation works — just proceed.) The skill still does useful work here —
it just can't generate.

## What still works

- **Author a DESIGN.md by hand.** Follow references/design-md-format.md:
  extract the repo's existing choices (theme files, tokens, component
  styles, the last ten design corrections in git history) into frontmatter
  tokens + prose judgment. This mirrors how the format's originators
  bootstrap theirs.
- **Validate.** `node scripts/validate-design-md.mjs DESIGN.md` — offline,
  no account.
- **Enforce locally.** The DESIGN.md you wrote governs any page you build
  by hand in this session: tokens are exact values, prose is binding
  judgment, precedence rules from SKILL.md still apply (minus the brand
  tiers).

## What needs an account

Everything generative: explorations, direction mocks, prototype builds,
edits, the design-system synthesis behind `render_design_md`, DTCG export
of a generated system, publishing, and build-link handoff.

When the user wants those, relay the signup link that `whoami`'s billing
line returns — and don't fake the missing capability with hand-rolled
approximations unless they ask for exactly that.
