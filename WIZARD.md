# WIZARD.md
# 7-phase development methodology for Claude Code and any AI coding agent.
# Type /wizard in Claude Code to activate, or paste this into any agent session.

---

## How to use this
At the start of any task, read this file fully.
Work through each phase in order.
Do not skip phases.
Do not move to the next phase until the current one is complete.

---

## Phase 1 — Understand
Before writing any code:
- Read CONTEXT.md, AGENT.md, and TASKS.md fully
- Identify which files you own
- Classify the task complexity:
  - Simple: 1–2 files, clear input/output
  - Medium: 3–5 files, some interdependencies
  - Complex: 6+ files, architectural decisions required
- Build a todo list of specific subtasks
- State your plan in a comment block at the top of your first file

Do not touch any code until this phase is complete.

---

## Phase 2 — Explore
Before writing any logic:
- Read every file you will need to import from
- Verify the exact function signatures and data shapes you depend on
- Check that the contracts in CONTEXT.md match what actually exists
- Identify anything that is missing or unclear
- If something is missing, write a TODO comment — do not guess or hallucinate

No code written in this phase. Exploration only.

---

## Phase 3 — Test first
Write tests before writing implementation:
- Write one test per function or component behaviour
- Tests should fail at this point — that is correct
- Cover:
  - Happy path (expected input, expected output)
  - Edge cases (null, empty, boundary values)
  - Error cases (bad input, missing data)
- Run the tests and confirm they fail
- If the project has no test setup, write the expected behaviour
  as commented pseudo-tests at the top of each file instead

---

## Phase 4 — Implement
Now write the actual code:
- Work through your todo list from Phase 1 one item at a time
- After each item, run tests and confirm they pass before moving on
- Follow the rules in AGENT.md exactly
- Use only the data shapes defined in CONTEXT.md
- Do not change any export signatures
- Do not install new packages

---

## Phase 5 — Verify
After all implementation is done:
- Run the full test suite
- Fix any regressions immediately
- Check that every export signature still matches CONTEXT.md
- Check that you have not touched files outside your ownership
- Check that no new packages were installed
- Confirm all TASKS.md checkboxes for your agent are done

---

## Phase 6 — Document
Before finishing:
- Add a comment block at the top of each file you created:
  - What this file does (one sentence)
  - What it exports
  - Any assumptions made
- Update TASKS.md — mark your tasks as [x] done
- If you changed any behaviour from what CONTEXT.md specified,
  leave a clear comment explaining why

---

## Phase 7 — Adversarial review
Read your own code as if you are trying to break it:
- What happens if a prop is null or undefined?
- What happens if the video file is corrupt or empty?
- What happens if MediaPipe fails to load?
- What happens if a function receives the wrong data type?
- What happens on a slow connection or old device?
- Fix every issue you find before declaring done
- Leave a comment for anything you chose not to fix and why

When Phase 7 is complete, notify the coordinator that your branch is ready to merge.

---

## Complexity guide
| Complexity | Phases to emphasise |
|------------|-------------------|
| Simple     | 1, 4, 7           |
| Medium     | 1, 2, 4, 5, 7     |
| Complex    | All 7 in full     |

---

## Quick reference
1. Understand — read everything, make a plan
2. Explore — verify what exists before depending on it
3. Test first — write failing tests
4. Implement — write code, run tests after each step
5. Verify — full suite, no regressions, check contracts
6. Document — comments, update TASKS.md
7. Adversarial review — try to break your own code
