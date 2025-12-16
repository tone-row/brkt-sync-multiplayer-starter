import { z } from 'zod';

// Session state schema - source of truth for multiplayer session state
export const SessionStateSchema = z.object({
  id: z.string(),
  isToggled: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type SessionState = z.infer<typeof SessionStateSchema>;

// Action types using discriminated unions for type safety
export const SessionActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('TOGGLE_SWITCH'),
    payload: z.object({
      userId: z.string(),
    }),
  }),
  z.object({
    type: z.literal('INITIALIZE_SESSION'),
    payload: z.object({
      sessionId: z.string(),
    }),
  }),
  z.object({
    type: z.literal('GET_STATE'),
    payload: z.object({
      userId: z.string(),
    }),
  }),
]);

export type SessionAction = z.infer<typeof SessionActionSchema>;

// Initial state factory
export function createInitialState(sessionId: string): SessionState {
  const now = Date.now();
  return {
    id: sessionId,
    isToggled: false,
    createdAt: now,
    updatedAt: now,
  };
}

// State reducer following flux patterns
export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  const now = Date.now();

  switch (action.type) {
    case 'TOGGLE_SWITCH':
      return {
        ...state,
        isToggled: !state.isToggled,
        updatedAt: now,
      };

    case 'INITIALIZE_SESSION':
      return createInitialState(action.payload.sessionId);

    case 'GET_STATE':
      // No state change for read operations
      return state;

    default:
      // TypeScript will ensure this is never reached due to discriminated union
      return state;
  }
}