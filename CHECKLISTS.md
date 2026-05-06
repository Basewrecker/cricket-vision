# Checklists

## New project setup
- [ ] npm create vite + template react
- [ ] npm install dependencies
- [ ] Tailwind config files created manually
- [ ] @tailwind directives in index.css
- [ ] manifest.json created in /public
- [ ] Apple meta tags in index.html
- [ ] vite-plugin-pwa installed
- [ ] git init + first commit
- [ ] CONTEXT.md written
- [ ] TASKS.md written

## Before opening agent sessions
- [ ] CONTEXT.md has file ownership table
- [ ] CONTEXT.md has all data type definitions
- [ ] CONTEXT.md has exact export signatures for every lib function
- [ ] CONTEXT.md has component prop definitions
- [ ] CONTEXT.md has agent prompt templates at the bottom
- [ ] Git branches created (one per agent)
- [ ] TASKS.md has checkboxes for every agent task

## Before merging a branch
- [ ] Agent confirms all tasks done
- [ ] No files touched outside agent's ownership list
- [ ] Export signatures match CONTEXT.md exactly
- [ ] No new packages installed without coordinator approval
- [ ] Code runs without errors on agent's branch

## Before shipping / deploying
- [ ] All branches merged into main
- [ ] App.jsx wiring complete
- [ ] End to end test: upload video → skeleton → scores → PDF export
- [ ] Tested on mobile (iPhone Safari)
- [ ] PWA installs correctly from browser
- [ ] npm run build completes with no errors
- [ ] Deployed to Vercel or Netlify over HTTPS

## When an agent gets stuck
- [ ] Check CONTEXT.md — is the contract clear enough?
- [ ] Check TASKS.md — is the task scoped correctly?
- [ ] Give the agent the exact function signature again
- [ ] If still stuck, take over that file yourself and reassign
