# Patterns

## Multi-agent development
- One CONTEXT.md per project — single source of truth
- One TASKS.md per project — track progress
- Each agent owns specific files only — no overlap
- Contracts (function signatures, data shapes) defined upfront in CONTEXT.md
- Coordinator wires everything in App.jsx at the end
- Every agent prompt starts with "Read CONTEXT.md fully before doing anything"

## Component structure
- One component per file
- No business logic in components — logic lives in /lib
- Components only handle UI and call lib functions via props
- Props documented as a comment block at top of each component file

## File structure (standard React project)
src/
  components/   → UI only
  lib/          → logic, utils, API calls
  hooks/        → custom React hooks
  assets/       → images, icons
App.jsx         → wiring only, minimal logic

## Git workflow
- main → production ready only
- feat/name → one branch per feature or agent
- Always commit before switching branches
- Merge into main only when feature is tested and working

## Styling (Tailwind)
- Dark theme default: bg-gray-950 page, bg-gray-900 cards
- Text: text-white primary, text-gray-400 secondary
- Good: emerald-500 / Warn: amber-400 / Bad: red-500
- Always use Tailwind scale — no arbitrary values unless unavoidable
- Rounded: rounded-lg cards, rounded-full badges and dots
