# BRKT Multiplayer Starter Kit

A production-ready starter kit for building coordination tools for the BRKT working group. This template demonstrates scalable patterns for multiplayer applications with shared state, real-time collaboration, and testable architecture.

## About BRKT

BRKT is a working group focused on building tools for coordination. This starter kit is based on battle-tested patterns and components from Resonance, one of our core tools, and serves as a foundation for future coordination applications.

## Why This Starter Kit Exists

Building scalable multiplayer applications requires careful consideration of **where state lives** and **how it flows through your system**. This starter demonstrates our proven approach to these challenges, making it easier for BRKT team members (especially non-frontend developers) to start projects faster while following established patterns.

## Core Architecture Philosophy

### Problem Modeling

Application scalability comes from correct problem modeling - essentially anticipating user behaviors (both current v1 needs and future requirements) and designing how your store needs to change as a result.

The key insight: **work backward from the view you want to the shape of data that needs to exist to support that view.** The difficulty comes in thinking through all the permutations of views you need to enable.

### State Architecture: Three Levels

We organize state based on **where it needs to live** and **how long it should persist**:

#### 1. Long-term Persisted State
- **Question**: "On refresh, should this still be true?"
- **Storage**: Database, file system, or durable storage
- **Examples**: User profiles, saved documents, configuration settings
- **Implementation**: **[Not Implemented]** - would require database or external storage
- **Future**: Could integrate with Party Server's durable storage or external DB

#### 2. Shared State (Session-scoped)
- **Question**: "Do other people need to see this during the active session?"
- **Storage**: Server memory for the duration of active connections
- **Examples**: Live collaboration state, real-time cursors, shared toggles
- **Implementation**:
  - **Development**: PartyKit room storage (persists during development session)
  - **Production**: In-memory only (resets when all users disconnect)
- **Note**: Currently, session state is lost when the last user leaves the room

#### 3. Short-term Client State
- **Question**: "Is this just for the browser right now? (would it be there if I refreshed?)"
- **Storage**: React state, local component state
- **Examples**: Form inputs, UI state, loading states, temporary selections
- **Implementation**: React useState, component state

## Tech Stack

- **Next.js** - React framework with App Router
- **shadcn/ui** - Component library for consistent UI patterns
- **TypeScript** - Type safety and developer experience
- **Party Server** - Real-time multiplayer capabilities on Cloudflare Workers
- **Zod** - Runtime validation and type generation
- **Bun** - Fast test runner and package manager

## Authentication Shortcut

Instead of complex authentication systems, we use a **lightweight user identification pattern**:

- **Persistent Identity**: User IDs stored in localStorage (`brkt-user-id`)
- **Collision-resistant**: Generated using `nanoid()` for URL-safe identifiers
- **Hydration-safe**: Prevents SSR mismatches with careful client-side initialization
- **Zero Config**: No auth providers, databases, or signup flows needed

This approach is perfect for coordination tools where you need to track users but don't need secure login.

## Flux Pattern & Testability

We implement a **Redux-style Flux pattern** that enables comprehensive testability:

### Why Flux?
- **Predictable State**: All state changes go through pure reducer functions
- **Type Safety**: Discriminated unions ensure action type safety
- **Testability**: Pure functions are easy to test in isolation
- **Debugging**: Clear audit trail of all state changes
- **Scalability**: Adding new actions and state is straightforward

### Implementation Pattern
```typescript
// 1. Define state schema with Zod
export const SessionStateSchema = z.object({
  id: z.string(),
  isToggled: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// 2. Define actions with discriminated unions
export const SessionActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('TOGGLE_SWITCH'),
    payload: z.object({ userId: z.string() }),
  }),
  // ... more actions
]);

// 3. Pure reducer function
export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'TOGGLE_SWITCH':
      return { ...state, isToggled: !state.isToggled, updatedAt: Date.now() };
    default:
      return state;
  }
}
```

### Testing Benefits
- **Unit Tests**: Test state transformations independently of UI
- **Validation**: Zod schemas ensure runtime safety
- **Immutability**: Guaranteed state immutability prevents bugs
- **Coverage**: Comprehensive test coverage in `lib/session.test.ts`

## State Flow

1. **Client Action**: User interaction triggers action creation
2. **Action Dispatch**: Action sent to Party Server via WebSocket
3. **Server Validation**: Zod validates action structure
4. **State Transformation**: Pure reducer applies action to current state
5. **State Persistence**: New state saved to Party Server storage
6. **State Broadcast**: Updated state sent to all connected clients
7. **UI Update**: React components re-render with new state

## Getting Started

### Development Setup

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the home page.

### Try the Multiplayer Demo

1. Navigate to `/session/your-session-name`
2. Open the same URL in multiple browser tabs/windows
3. Toggle the switch - see real-time updates across all tabs

### Code Quality

Always run these commands after making changes:

```bash
bun run typecheck  # Check for TypeScript errors
bun run lint       # Check for linting issues
bun test           # Run test suite
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── session/[sessionId] # Multiplayer session page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── user-provider.tsx # User identification wrapper
├── hooks/                # Custom React hooks
│   └── useUserId.ts      # User ID management
├── lib/                  # Core business logic
│   ├── session.ts        # State management (Zod schemas, reducers)
│   └── session.test.ts   # Comprehensive state tests
├── party/                # Real-time server code
│   ├── server.ts         # Development server (PartyKit)
│   └── index.ts          # Production server (Cloudflare Workers)
└── AGENT.md              # Detailed development guide
```

## Adding New Features

1. **Model the Problem**: Identify what views you need and work backward to required state shape
2. **Determine State Location**: Decide if state is persisted, shared, or client-only
3. **Extend Schema**: Add new fields to `SessionStateSchema` in `lib/session.ts`
4. **Create Actions**: Define new actions in `SessionActionSchema`
5. **Update Reducer**: Add cases to `sessionReducer` function
6. **Write Tests**: Add test cases for new functionality
7. **Build UI**: Create React components that use the new state
8. **Validate**: Run typecheck, lint, and tests

## For Non-Frontend Developers

This starter kit is designed to be approachable even if you're not primarily a frontend developer:

- **Type Safety**: TypeScript catches errors at compile time
- **Clear Patterns**: Consistent patterns for state management and API design
- **Comprehensive Tests**: Test-driven approach ensures reliability
- **Documentation**: Detailed AGENT.md for development guidance
- **Minimal Setup**: No complex authentication or database setup required

The Flux pattern especially helps non-frontend developers because it treats state changes like API endpoints - each action is a clearly defined operation with inputs and outputs.

## Learn More

- See `AGENT.md` for detailed development patterns and guidance
- Study `lib/session.ts` and `lib/session.test.ts` for state management examples
- Explore the session page at `app/session/[sessionId]/page.tsx` for real-time implementation patterns