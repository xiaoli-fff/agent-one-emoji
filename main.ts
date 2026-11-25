// Your Agent in One Emoji — the entry is a single emoji: the genie.
//
// Why the genie, worked out in this session:
// The agent's whole contract is "your wish is my command". You summon it
// with a request, it works where you cannot see it, and it comes back with
// the result done. A genie is that contract in one face: called on, not
// switched on; it grants what you ask instead of standing on a desk like a
// machine. That is specific to how an agent works — summoned, unseen,
// delivering outcomes — where the robot is just "a machine" and the compass
// is just "finds the way". The glyph also reads instantly at small size: a
// familiar face with a turban and beard, one of the most recognisable faces
// in the emoji set, playful in tone, and it needs no caption to land.
// It is distinctive too: at the time of writing, none of the 152 entries
// already in the field had picked the genie, while the compass, owl, ant,
// bee and octopus had all been taken several times over.
//
// The entry is a single fixed glyph. Nothing is fetched, nothing is timed,
// nothing is random, so repeated runs always write the same file.
// Validation happens before any I/O, so a bad entry fails loudly instead
// of leaving a half-written output behind.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Contest gate: entry.txt must be UTF-8 text of 1 to 16 characters.
const ENTRY_LIMIT = 16;

// The entry itself. Kept verbatim: the glyph alone, nothing else.
const ENTRY = "🧞";

// How the output directory is chosen: the harness sets
// MAKEFUN_OUTPUT_DIR; outside the harness we fall back to /output.
const DEFAULT_OUTPUT_DIR = "/output";
// The entry is written as-is, with no trailing newline added.
const OUTPUT_FILENAME = "entry.txt";

// Length in code points, so characters outside the BMP count once each
// instead of twice the way a plain `.length` would count them.
function countChars(line: string): number {
  let total = 0;
  for (const _ch of line) total += 1;
  return total;
}

function hasBadWhitespace(line: string): boolean {
  return line.trim() !== line;
}

function checkSingleLine(line: string): void {
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

// Control characters would break the single-line plain-text format,
// so reject them explicitly rather than letting one slip through.
function checkNoControlChars(line: string): void {
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20) {
      throw new Error("entry contains a control character");
    }
  }
}

// An empty entry, or one that is only spaces, has nothing to say.
function checkNotEmpty(line: string): void {
  if (line.length === 0 || line.trim().length === 0) {
    throw new Error("entry is empty or only whitespace");
  }
}

// Every rule the contest imposes on the entry, checked up front.
// The brief asks for one emoji, the glyph alone, so the entry must be
// exactly one code point — not merely within the 16-character gate.
function validateEntry(line: string): void {
  const len = countChars(line);
  checkNotEmpty(line);
  if (len !== 1) {
    throw new Error(`entry must be exactly one emoji, got ${len} characters`);
  }
  if (len > ENTRY_LIMIT) {
    throw new Error(
      `entry is ${len} characters, ${len - ENTRY_LIMIT} over the ${ENTRY_LIMIT} limit`,
    );
  }
  if (hasBadWhitespace(line)) {
    throw new Error("entry has leading or trailing whitespace");
  }
  checkSingleLine(line);
  checkNoControlChars(line);
}

function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
}

function emitEntry(line: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, OUTPUT_FILENAME);
  writeFileSync(target, line, "utf8");
  return target;
}

// Pipeline: validate first, then write, then report. Nothing is written
// until every check has passed, so a failed run leaves no output behind.
function main(): void {
  validateEntry(ENTRY);
  const target = emitEntry(ENTRY, resolveOutputDir());
  console.log(`wrote ${countChars(ENTRY)}-character entry to ${target}`);
}

main();
