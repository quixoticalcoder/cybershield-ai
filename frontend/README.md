# cybershield-ai frontend

Next.js 16.2.6 and React 19.2.4 client for the chat and moderation prototype. See the [root README](../README.md) for backend setup, model behavior, and security limitations.

## Development

Use Node.js 20.9+ and start the FastAPI backend at `http://127.0.0.1:8000`.

```bash
npm ci
npm run dev
```

The frontend hardcodes its HTTP/WebSocket backend addresses. There is no API-origin environment setting. Update those references before remote hosting.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js server |
| `npm run build` | Production build |
| `npm start` | Serve a completed build |
| `npm run lint` | ESLint; existing errors and warnings remain |

`app/page.tsx` contains the chat, account screens, media submission, and integrated admin views. `app/components/admin/` contains report, evidence, history, user, and settings components. `app/admin/page.tsx` supplies an additional admin route. `app/layout.tsx` configures project metadata and Google fonts.

Client-side moderation flags and admin routing do not enforce API authorization. Use disposable accounts and messages when exploring this prototype. Production builds may need network access to fetch the configured fonts.
