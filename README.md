# BRKT Multiplayer Starter Kit

A starter kit for building coordination tools for the BRKT working group. This template provides a foundation for creating multiplayer applications with shared state and real-time collaboration features.

## About BRKT

BRKT is a working group focused on building tools for coordination. This starter kit is based on patterns and components from Resonance, one of our core tools, and serves as a foundation for future coordination applications.

## Tech Stack

- **Next.js** - React framework
- **shadcn/ui** - Component library
- **TypeScript** - Type safety
- **Party Server** - Real-time multiplayer capabilities
- **Light User Identification** - Persistent user identity via localStorage without requiring full authentication

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Development

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

For detailed development guidance and patterns, see `AGENT.md`.