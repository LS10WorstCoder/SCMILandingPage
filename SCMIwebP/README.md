# Club Landing Page (Minimal)

This is a minimal, static landing-page scaffold implementing the Club Landing Page PRD. It uses Vite for a fast dev server and build pipeline.

What's included

- `index.html` — the landing page with hero, features, pricing, and a signup form.
- `src/styles.css` — responsive styles.
- `src/main.js` — basic form handling (validates and stores subscribers to localStorage as a demo).
- `assets/logo.svg` — simple logo placeholder.
- `package.json` — dev script using Vite.

How to run (Windows PowerShell)

```powershell
# from project root c:\Users\Ted\SCMIwebP
npm install
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173).

Next steps / recommended additions

- Hook the signup form to a real backend (e.g., serverless function or webhook).
 - Hook the signup form to a real backend (e.g., serverless function or webhook). This project now includes a small server that forwards RSVPs to the Resend API and emails them to genFaq@scmi.club.

Server (Resend) instructions

1. Create a `.env.local` file in the project root and add your Resend API key (do NOT commit this file):

```text
# .env.local
RESEND_API_KEY=sr_XXXXXXXXXXXXXXXXXXXXXXXX
```

2. Install dependencies and start the server (Windows PowerShell):

```powershell
npm install
npm start
```

This starts a small Express server on http://localhost:3000 which serves the static site and exposes `POST /api/send-email`. The front-end form at `index.html` will POST form data to that endpoint, and the server will call the Resend REST API to send the email to `genFaq@scmi.club`.

Notes
- The server uses the built-in `fetch` available in modern Node versions (Node 18+). If you run an older Node runtime, install a fetch polyfill (for example `node-fetch`) and adapt `server.js` accordingly.
- Keep `RESEND_API_KEY` secret. Use the `.env.local.example` as a template.
- Add analytics and A/B testing hooks.
- Add unit/E2E tests for key flows.
- Integrate with CMS or marketing automation as required by PRD.
