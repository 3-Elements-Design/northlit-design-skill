#!/usr/bin/env node
// Standalone validator for google-labs-code/design.md compatible files.
// Spec: https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
//
// Zero dependencies, no network. Mirrors Northlit's in-product checks:
//   errors   — what DesignMdSpecSchema requires (name; colors.primary;
//              at least one typography token) plus broken {bucket.key}
//              references in component props (findBrokenRefs semantics:
//              a ref only counts when it is the prop's ENTIRE value and
//              has exactly two path segments)
//   warnings — everything the product treats leniently: unknown component
//              props (the renderer strips them), incomplete typography
//              entries, out-of-order or unknown H2 sections ("section
//              order is normative; section presence is optional"), and
//              the unquoted-hex trap (`primary: #fff` parses as an empty
//              value in YAML — the # starts a comment)
//
// Usage:  node validate-design-md.mjs <DESIGN.md> [--strict] [--quiet]
// Exit:   0 valid (warnings allowed unless --strict) · 1 invalid · 2 usage/IO
//
// MIT — part of the northlit-design skill.

import { readFileSync } from "node:fs";

const SECTION_ORDER = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts",
];
const REF_BUCKETS = ["colors", "typography", "rounded", "spacing"];
const KNOWN_COMPONENT_PROPS = [
  "backgroundColor",
  "textColor",
  "typography",
  "rounded",
  "padding",
  "size",
  "height",
  "width",
];
const TYPOGRAPHY_REQUIRED = ["fontFamily", "fontSize", "fontWeight", "lineHeight"];

// ── minimal YAML-subset parser ─────────────────────────────────────────────
// Covers exactly what the format uses: nested maps with scalar leaves,
// double-quoted or plain scalars, ~ / {} / [] literals. No anchors, no
// multi-line scalars, no sequences-of-maps.

function parseScalar(raw, quoted) {
  if (quoted) return raw.replace(/\\"/g, '"');
  if (raw === "~" || raw === "null") return null;
  if (raw === "{}") return {};
  if (raw === "[]") return [];
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

function parseMap(lines, start, indent, problems) {
  const obj = {};
  let i = start;
  while (i < lines.length) {
    const { n, ind, text } = lines[i];
    if (text === "") {
      i++;
      continue;
    }
    if (ind < indent) break;
    if (ind > indent) {
      problems.error(`frontmatter line ${n}: unexpected indent`);
      i++;
      continue;
    }
    const m = text.match(/^(?:"((?:[^"\\]|\\.)*)"|([^\s":]+))\s*:(?:\s+(.*))?$/);
    if (!m) {
      problems.error(`frontmatter line ${n}: expected \`key: value\`, got \`${text}\``);
      i++;
      continue;
    }
    const key = m[1] !== undefined ? m[1].replace(/\\"/g, '"') : m[2];
    let rest = m[3] ?? "";
    const quoted = rest.startsWith('"');
    if (quoted) {
      const qm = rest.match(/^"((?:[^"\\]|\\.)*)"\s*(#.*)?$/);
      if (!qm) {
        problems.error(`frontmatter line ${n}: unterminated quoted value`);
        i++;
        continue;
      }
      obj[key] = parseScalar(qm[1], true);
      i++;
      continue;
    }
    rest = rest.replace(/\s*#.*$/, "").trim(); // trailing comment (plain scalars only)
    if (rest !== "") {
      obj[key] = parseScalar(rest, false);
      i++;
      continue;
    }
    // `key:` with nothing after — either a nested map or an empty value.
    let j = i + 1;
    while (j < lines.length && lines[j].text === "") j++;
    if (j < lines.length && lines[j].ind > indent) {
      const [child, next] = parseMap(lines, j, lines[j].ind, problems);
      obj[key] = child;
      i = next;
    } else {
      obj[key] = "";
      i++;
    }
  }
  return [obj, i];
}

function parseFrontmatter(source, problems) {
  const all = source.split(/\r?\n/);
  if (all[0]?.trim() !== "---") {
    problems.error("no frontmatter: file must open with `---` on line 1");
    return { frontmatter: null, body: source };
  }
  const end = all.findIndex((l, idx) => idx > 0 && l.trim() === "---");
  if (end === -1) {
    problems.error("frontmatter never closes: missing second `---`");
    return { frontmatter: null, body: source };
  }
  const lines = all.slice(1, end).map((raw, idx) => {
    const noComment = /^\s*#/.test(raw) ? "" : raw;
    return {
      n: idx + 2, // 1-based, accounting for the opening ---
      ind: noComment.match(/^ */)[0].length,
      text: noComment.trim(),
    };
  });
  const [frontmatter] = parseMap(lines, 0, 0, problems);
  return { frontmatter, body: all.slice(end + 1).join("\n") };
}

// ── checks ─────────────────────────────────────────────────────────────────

function isMap(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function checkTokens(fm, problems) {
  if (typeof fm.name !== "string" || fm.name === "") {
    problems.error("frontmatter: `name` is required");
  }
  if (!isMap(fm.colors) || Object.keys(fm.colors).length === 0) {
    problems.error("frontmatter: `colors` map is required");
  } else {
    if (!("primary" in fm.colors)) {
      problems.error("frontmatter: `colors` must include a `primary` token");
    }
    for (const [k, v] of Object.entries(fm.colors)) {
      if (v === "" || v === null) {
        problems.warn(
          `colors.${k} is empty — if the value was an unquoted hex like #fff, YAML read the # as a comment; quote it: "#fff"`,
        );
      }
    }
  }
  if (!isMap(fm.typography) || Object.keys(fm.typography).length === 0) {
    problems.error("frontmatter: at least one `typography` token is required");
  } else {
    for (const [name, t] of Object.entries(fm.typography)) {
      if (!isMap(t)) {
        problems.warn(
          `typography.${name} should be a map ({fontFamily, fontSize, fontWeight, lineHeight}), got a scalar`,
        );
        continue;
      }
      for (const req of TYPOGRAPHY_REQUIRED) {
        if (!(req in t)) problems.warn(`typography.${name} is missing \`${req}\``);
      }
    }
  }
  for (const bucket of ["rounded", "spacing"]) {
    if (bucket in fm && !isMap(fm[bucket])) {
      problems.warn(`frontmatter: \`${bucket}\` should be a map of name → dimension`);
    }
  }
}

// Faithful port of Northlit's findBrokenRefs: a ref is checked only when the
// prop's whole value is {bucket.key} with exactly two path segments.
function checkRefs(fm, problems) {
  if (!isMap(fm.components)) {
    if ("components" in fm) {
      problems.warn("frontmatter: `components` should be a map of name → props");
    }
    return;
  }
  for (const [compName, props] of Object.entries(fm.components)) {
    if (!isMap(props)) {
      problems.warn(
        `components.${compName} should be a map of props (backgroundColor, textColor, …), got a scalar`,
      );
      continue;
    }
    for (const [propName, propValue] of Object.entries(props)) {
      if (!KNOWN_COMPONENT_PROPS.includes(propName)) {
        problems.warn(
          `components.${compName}.${propName} is not a spec prop — renderers will strip it`,
        );
      }
      if (typeof propValue !== "string") continue;
      const match = propValue.match(/^\{([a-zA-Z0-9_.-]+)\}$/);
      if (!match) continue;
      const path = match[1].split(".");
      if (path.length !== 2) continue;
      const [bucket, key] = path;
      const tokens = REF_BUCKETS.includes(bucket) ? fm[bucket] : undefined;
      if (!isMap(tokens) || !(key in tokens)) {
        problems.error(`broken ref: components.${compName}.${propName} → {${match[1]}}`);
      }
    }
  }
}

function checkSections(body, problems) {
  const headings = [...body.matchAll(/^## +(.+?) *$/gm)].map((m) => m[1]);
  let cursor = -1;
  for (const h of headings) {
    const pos = SECTION_ORDER.indexOf(h);
    if (pos === -1) {
      problems.warn(`unknown section \`## ${h}\` — not part of the spec's section set`);
      continue;
    }
    if (pos < cursor) {
      problems.warn(
        `section \`## ${h}\` is out of order — the spec's section order is normative (${SECTION_ORDER.join(" → ")})`,
      );
    }
    cursor = Math.max(cursor, pos);
  }
}

// ── cli ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const quiet = args.includes("--quiet");
const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("usage: node validate-design-md.mjs <DESIGN.md> [--strict] [--quiet]");
  process.exit(2);
}

let source;
try {
  source = readFileSync(file, "utf8");
} catch (err) {
  console.error(`cannot read ${file}: ${err.message}`);
  process.exit(2);
}

const errors = [];
const warnings = [];
const problems = {
  error: (msg) => errors.push(msg),
  warn: (msg) => warnings.push(msg),
};

const { frontmatter, body } = parseFrontmatter(source, problems);
if (frontmatter) {
  checkTokens(frontmatter, problems);
  checkRefs(frontmatter, problems);
}
checkSections(body, problems);

if (!quiet) {
  for (const e of errors) console.error(`  error    ${e}`);
  for (const w of warnings) console.error(`  warning  ${w}`);
}
const verdict =
  errors.length > 0
    ? "invalid"
    : warnings.length > 0
      ? "valid (with warnings)"
      : "valid";
console.log(`${file}: ${verdict} — ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length > 0 || (strict && warnings.length > 0) ? 1 : 0);
