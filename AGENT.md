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

#### Development Configuration

- **Development Server**: Runs on `127.0.0.1:1999` via PartyKit dev server
- **Production Server**: Uses Cloudflare Workers with Durable Objects via Wrangler
- **Party Name**: `"brkt-starter"` (matches `partykit.json` configuration)  
- **Environment Variable**: `NEXT_PUBLIC_PARTYKIT_HOST` can override the default host
- **Dual Implementation**: `party/server.ts` for development, `party/index.ts` for production

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
  host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999",
  room: "session-room-id",
  id: userId!,
  startClosed: !userId,
  // ... other config
});
```

This system provides persistent identity without authentication complexity, perfect for coordination tools where you need to track users but don't need secure login.

#### Hydration Handling

The `useUserId` hook is designed to prevent hydration mismatches by:
- Returning `null` during server-side rendering
- Only generating/retrieving the user ID after client hydration is complete
- Using a single state update to avoid cascading renders
- Ensuring consistent server/client rendering behavior

### Project Structure

This starter kit is based on patterns from Resonance, a coordination tool built by the BRKT working group.

### State Management

The starter kit implements a robust state management system following Flux patterns for predictable, testable multiplayer state:

#### Core Concepts

- **Session State Schema**: Defined in `lib/session.ts` using Zod for runtime validation and TypeScript type generation
- **Source of Truth**: Session state serves as the single source of truth for all multiplayer session data
- **Action System**: Uses discriminated unions for type-safe actions that modify state
- **Immutable Updates**: State transformations always return new state objects, never mutate existing state
- **Unit Testing**: State transformations are pure functions, making them easy to test in isolation

#### State Schema Structure

```typescript
// Session state - the shared data structure
export const SessionStateSchema = z.object({
  id: z.string(),
  isToggled: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Actions - typed operations that modify state
export const SessionActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('TOGGLE_SWITCH'),
    payload: z.object({ userId: z.string() }),
  }),
  // ... other actions
]);
```

#### State Management Flow

1. **Client Action**: User interaction triggers an action creation
2. **Action Dispatch**: Action is sent to Party Server via WebSocket
3. **Server Validation**: Zod validates the action structure
4. **State Transformation**: Pure reducer function applies action to current state
5. **State Persistence**: New state is saved to Party Server storage
6. **State Broadcast**: Updated state is sent to all connected clients
7. **UI Update**: React components re-render with new state

#### Testing State Logic

State transformations are thoroughly tested using Bun's test runner:

```bash
bun test  # Run all tests including state management tests
```

Tests cover:
- Action validation with Zod schemas
- State transformation logic
- Immutability guarantees
- Edge cases and error conditions

#### Adding New State Features

1. **Extend Schema**: Add new fields to `SessionStateSchema`
2. **Create Actions**: Define new actions in `SessionActionSchema`
3. **Update Reducer**: Add cases to `sessionReducer` function
4. **Write Tests**: Add test cases for new functionality
5. **Update UI**: Create React components that use the new state

### Development Workflow

After adding any new features or making code changes, always run the following commands to ensure code quality:

```bash
bun run typecheck  # Check for TypeScript errors
bun run lint       # Check for linting issues
bun test           # Run test suite
```

These checks help maintain code quality and catch issues early in development.

### Getting Started

*This document will be expanded with specific patterns, components, and development guidelines as features are implemented.*