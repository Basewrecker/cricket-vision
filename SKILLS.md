# Skills

## Setting up a React + Vite project
1. npm create vite@latest appname -- --template react
2. cd appname && npm install
3. npm install -D tailwindcss postcss autoprefixer
4. Create tailwind.config.js and postcss.config.js manually (init command broken in v4)
5. Add @tailwind directives to src/index.css
6. Configure tailwind.config.js content to include ./src/**/*.{js,jsx}

## Making a React app a PWA
1. npm install -D vite-plugin-pwa
2. Create public/manifest.json with name, short_name, display, theme_color, icons
3. Add <link rel="manifest"> and apple meta tags to index.html
4. Add VitePWA plugin to vite.config.js

## Setting up multi-agent sessions
1. Write CONTEXT.md — file ownership, data contracts, agent prompts
2. Write TASKS.md — checkboxes per agent
3. git checkout -b feat/agentname for each session
4. Open one terminal tab per agent
5. Paste the agent prompt from CONTEXT.md into each session
6. Let agents run in parallel
7. Coordinator merges branches and wires App.jsx last

## Adding a new lib module
1. Create the file in src/lib/
2. Define the export signature in CONTEXT.md before writing any code
3. Build the function
4. Import and wire in App.jsx
5. Update TASKS.md

## Deploying a Vite app
1. npm run build → generates /dist
2. Vercel: drag /dist folder into vercel.com or run vercel CLI
3. Netlify: drag /dist into netlify.com or connect GitHub repo
4. For PWA: must be served over HTTPS (Vercel and Netlify both do this)

## Fixing Tailwind not working
- Check tailwind.config.js content includes ./src/**/*.{js,jsx}
- Check index.css has @tailwind base/components/utilities
- Check postcss.config.js has tailwindcss and autoprefixer plugins
- Restart dev server after config changes

## Installing MediaPipe via CDN (not npm)
- Do not npm install @mediapipe/pose
- Inject a script tag at runtime pointing to jsdelivr CDN
- Wait for window.Pose to exist before using it
- Use locateFile to point model files to the same CDN base URL
