# AGENT.md

## Development Guide for BRKT Starter Kit

This document provides development guidance and patterns for working with the BRKT multiplayer starter kit.

### Framework & Libraries

- **Next.js**: React framework with App Router
- **shadcn/ui**: Component library for consistent UI patterns
- **TypeScript**: For type safety and better developer experience
- **Party Server**: Real-time multiplayer server running on Cloudflare Workers

### Real-time Capabilities

Real-time multiplayer capabilities are central to this starter kit. We use Party Server to handle WebSocket connections, user presence, and message broadcasting across connected clients. This enables features like live collaboration, shared state updates, and coordinated interactions between users.

### User Identification

The starter kit includes a lightweight user identification system that persists user identity across sessions without requiring full authentication:

- **Storage**: User IDs are stored in localStorage with the key `brkt-user-id`
- **Generation**: Unique IDs are generated using `nanoid()` for URL-safe, collision-resistant identifiers
- **Persistence**: IDs are automatically created on first visit and persist across browser sessions
- **Provider**: The `UserProvider` component wraps the entire app and ensures a user ID exists before rendering content
- **Loading State**: Shows "Loading user..." until the user ID is established
- **Party Server Integration**: User IDs are passed as connection IDs to Party Server for real-time identification

#### Usage Pattern

```typescript
// Get user ID in any component
const userId = useUserId();

// Connect to Party Server with user ID
const socket = usePartySocket({
  id: userId!,
  startClosed: !userId,
  // ... other config
});
```

This system provides persistent identity without authentication complexity, perfect for coordination tools where you need to track users but don't need secure login.

### Project Structure

This starter kit is based on patterns from Resonance, a coordination tool built by the BRKT working group.

### Development Workflow

After adding any new features or making code changes, always run the following commands to ensure code quality:

```bash
bun run typecheck  # Check for TypeScript errors
bun run lint       # Check for linting issues
```

These checks help maintain code quality and catch issues early in development.

### Getting Started

*This document will be expanded with specific patterns, components, and development guidelines as features are implemented.*