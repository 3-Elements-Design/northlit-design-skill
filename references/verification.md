# Verification protocol

Run after every build or edit that claims to honor the contract. Report
results; never assert adherence you didn't check.

## 1 · Reference integrity (deterministic)

- `render_design_md` on the direction's design system.
- `brokenRefs` must be `[]`. Any entry is a defect: name it, fix the system
  or the reference, re-render.

## 2 · Token diff (deterministic)

- `export_dtcg` for the direction.
- If the repo has `design/tokens.json`, diff token-by-token. For each
  divergence record: token path, repo value, built value, and a
  classification —
  - **drift** — unintended; fix the prototype with `edit_prototype` until
    the token matches, or correct the system;
  - **evolution** — intended by this brief; carries into the write-back PR
    with one line of rationale.
- No repo tokens yet? Step 5 of the loop creates them; note that this is
  the contract's first version.

## 3 · Judgment review (model-graded, honest about it)

- Where available, call `critique_design` on the chosen card (billable): it
  returns 0–100 rubric scores (overall, hierarchy, typography, color,
  layout, content), severity-ranked issues each with a concrete fix, and a
  single refine-ready `fixPrompt`. Report the scores and top issues; offer
  the fixPrompt as a next iteration — never apply it unasked. On older
  servers the tool is absent — fall through to the manual review below.
- Re-read the DESIGN.md prose sections (and the locked brand's voice and
  anti-defaults). Walk the built page against each "Do's and Don'ts" entry
  and each named anti-pattern; quote the section next to anything that
  violates it.
- This tier is opinion, not measurement — critique scores included. Say so
  in your report, and keep it separate from the deterministic results above.

## What this protocol does not cover (yet)

Northlit's conformance rule engine is not exposed over the API. Adherence
here = reference integrity + token diff + the model-graded review. The
critique score is a quality judgment, not a brand-adherence measurement —
do not present one as the other.
