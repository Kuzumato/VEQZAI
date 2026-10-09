# VEQZAI
VEQZAI is built for people who want to create, compete, explore, and grow beyond traditional limits—turning ideas, skills, and technology into new possibilities.

## AI Hub

`pages/ai/ai-hub.html` (linked from the home page and the dashboard menu) contains four tools that run entirely in the browser:

| Tab | What it does | Code |
| --- | --- | --- |
| Matchmaking | Elo-style rating, ping- and role-aware match scoring, widening search window | `assets/js/ai/ai-matchmaking.js` |
| Recommendations | Content-based game suggestions that explain themselves | `assets/js/ai/ai-recommendations.js` |
| Moderation | Explainable scoring for harassment, threats, scams, personal info and spam | `assets/js/ai/ai-moderation.js` |
| Assistant | FAQ retrieval assistant that admits when it is unsure | `assets/js/ai/ai-assistant.js` |

Notes
- The player pool and game catalog are sample data. Replace `buildPool()` and `CATALOG` with your real services.
- Edit the `KB` array in `ai-assistant.js` so answers match what is actually live.
- To use a real LLM for the assistant, set `window.VEQZAI_AI_CONFIG = { assistantEndpoint: 'https://your-server/ask' }` before the scripts load. The endpoint receives `{ question, context }` and returns `{ answer }`. Keep API keys on that server, never in this repo. If it fails, the local answer is used.
- `VeqzaiAI.moderation.check(text)` can be reused anywhere (for example on fan posts), but enforce moderation on the server as well, because browser code can be bypassed.
