# ✍️ Multi-platform Content Generator — ECO

> One theme echoed across Twitter, LinkedIn, Instagram and a blog, painted in the ividi.dev palette (black, burnt orange, amber).

[🐞 Report Bug](https://github.com/VidiPT89/Multi-platformContentGenerator/issues) · [✨ Request Feature](https://github.com/VidiPT89/Multi-platformContentGenerator/issues)

ECO is a Next.js press for social copy. You give a theme and a tone; four plates fill in parallel: an X/Twitter post, a LinkedIn piece, an Instagram caption and a Markdown blog article. Edit on the plate, save a history and schedule through Buffer or a local queue. The UI is European Portuguese / English, with language and dark / light theme toggles remembered in `localStorage`. Light mode keeps the same ividi.dev palette on cream paper.

Without a model key, the press still prints local plates. Without a Buffer token, scheduled posts stay in a local queue on this computer.

## ✨ Main Features

- 🎯 **Theme + tone** — formal, warm, punchy or playful
- 📰 **Four outputs in parallel** — X, LinkedIn, Instagram, blog
- ✏️ **Inline edit** — tune each plate before you publish
- 🗂️ **History** — reopen a saved pack
- 📅 **Scheduling** — Buffer API when a token is set, otherwise a local queue
- 🌍 **PT / EN toggle** — remembered in `localStorage`
- 🌓 **Dark / light** — same burnt orange and amber, cream paper in light mode
- 🎬 **Motion** — ember glow, stacked plates and ink bars while printing

## 🛠️ Technologies

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-000000?style=flat&logo=vercel&logoColor=white)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **App** | Next.js App Router | Pages and API routes |
| **Copy** | Vercel AI SDK, optional Groq / Gemini / OpenAI / Anthropic | Parallel streaming per platform |
| **Schedule** | Buffer API (optional) | Queue updates on connected profiles |
| **Motion** | Framer Motion | Landing and plate reveal |

## 🧱 Project Structure

```text
Multi-platformContentGenerator/
├── src/
│   ├── app/
│   ├── components/
│   ├── i18n/
│   └── lib/
├── tests/
├── LICENSE
└── README.md
```

## ▶️ How to Run

### Prerequisites

- **Node.js** 18+
- Optional: one free-tier model key (Groq or Gemini preferred)
- Optional: a Buffer access token if you want remote scheduling

### Installation

```bash
git clone https://github.com/VidiPT89/Multi-platformContentGenerator.git
cd Multi-platformContentGenerator
cp .env.example .env
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To use a hosted model, set `GROQ_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` (or `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`). `AI_MODEL` is optional.

To schedule through Buffer, set `BUFFER_ACCESS_TOKEN`. Blog copy always stays on the local queue (Buffer has no blog profile).

## 📖 Usage

1. Toggle **PT** or **EN**, and **Dark** or **Light**, in the header.
2. Open the press. Write a theme and pick a tone.
3. Generate the four voices. Edit any plate inline.
4. Copy, save to history, or pick a time and schedule.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Stream four platform drafts |
| GET / POST / PATCH | `/api/history` | List, save or edit packs |
| GET / POST | `/api/schedule` | Local queue or Buffer create |

## 🧪 Testing

```bash
npm test
```

`node:test` checks local plates per tone and locale, Twitter clipping, theme parsing and Buffer profile matching.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

Developed by **David Arsénio Martins**  
🌐 [ividi.dev](https://ividi.dev/) · 💻 [github.com/VidiPT89](https://github.com/VidiPT89/)
