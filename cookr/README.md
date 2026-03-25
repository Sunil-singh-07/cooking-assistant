# Cookr 🍳 — AI-Powered Cooking Voice Assistant

A full-stack AI cooking assistant with real-time voice interaction. Speak your queries and receive hands-free, step-by-step recipe guidance powered by LLaMA 3.3.

🔗 **Live Demo:** [cooking-assistant-alpha.vercel.app](https://cooking-assistant-alpha.vercel.app)

---

## Features

- 🎙️ **Voice interaction** — speak queries, get hands-free recipe guidance via Web Speech API
- 🤖 **AI-powered chat** — per-step contextual Q&A using Groq API (LLaMA 3.3) without losing conversation state
- 🗣️ **5 TTS personas** — choose a cooking companion personality via ElevenLabs
- 🔐 **Auth & sessions** — persistent user session management via Supabase
- 📱 **Mobile-friendly** — responsive React + Vite frontend optimized for kitchen use

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| AI / LLM | Groq API (LLaMA 3.3) |
| Text-to-Speech | ElevenLabs TTS |
| Speech Recognition | Web Speech API |
| Backend / Auth | Supabase |

---

## Getting Started

### Prerequisites

- Node.js v18+
- A [Groq API](https://console.groq.com) account
- An [ElevenLabs](https://elevenlabs.io) account
- A [Supabase](https://supabase.com) project

### Installation

```bash
# Clone the repo
git clone https://github.com/Sunil-singh-07/cooking-assistant.git
cd cooking-assistant/cookr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your API keys in .env

# Start the dev server
npm run dev
```

---

## Environment Variables

Create a `.env` file in the `cookr/` directory with the following keys:

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## Project Structure

```
cookr/
├── src/
│   ├── App.jsx         # Root component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment variable template
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Deployment

This project is deployed on **Vercel**. Every push to `main` triggers an automatic redeployment.

To deploy your own instance:
1. Fork this repo
2. Import into [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings
4. Deploy

---

## Author

**Sunil Singh**
B.Tech CSE — Amity University Lucknow

- GitHub: [@Sunil-singh-07](https://github.com/Sunil-singh-07)
- LinkedIn: [sunil-airy-7888882a2](https://www.linkedin.com/in/sunil-airy-7888882a2/)
- Email: sunilairy6@gmail.com
