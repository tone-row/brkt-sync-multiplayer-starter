// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Bun test types not available in TypeScript config
import { describe, it, expect } from "bun:test";
import { sessionReducer, createInitialState, SessionActionSchema } from "./session";
import type { SessionState, SessionAction } from "./session";

describe("Session State Management", () => {
  describe("createInitialState", () => {
    it("should create initial state with correct structure", () => {
      const sessionId = "test-session-123";
      const state = createInitialState(sessionId);

      expect(state.id).toBe(sessionId);
      expect(state.isToggled).toBe(false);
      expect(typeof state.createdAt).toBe("number");
      expect(typeof state.updatedAt).toBe("number");
      expect(state.createdAt).toBe(state.updatedAt);
    });
  });

  describe("sessionReducer", () => {
    const getInitialState = (): SessionState => {
      const state = createInitialState("test-session");
      // Set fixed timestamps for predictable testing
      state.createdAt = 1000;
      state.updatedAt = 1000;
      return state;
    };

    it("should handle TOGGLE_SWITCH action", () => {
      const initialState = getInitialState();
      const action: SessionAction = {
        type: "TOGGLE_SWITCH",
        payload: { userId: "user-123" },
      };

      const newState = sessionReducer(initialState, action);

      expect(newState.isToggled).toBe(true);
      expect(newState.id).toBe(initialState.id);
      expect(newState.createdAt).toBe(initialState.createdAt);
      expect(newState.updatedAt).toBeGreaterThan(initialState.updatedAt);
      expect(newState).not.toBe(initialState); // Immutability check
    });

    it("should toggle switch back to false", () => {
      const initialState = getInitialState();
      const toggledState = { ...initialState, isToggled: true };
      
      const action: SessionAction = {
        type: "TOGGLE_SWITCH",
        payload: { userId: "user-123" },
      };

      const newState = sessionReducer(toggledState, action);

      expect(newState.isToggled).toBe(false);
    });

    it("should handle INITIALIZE_SESSION action", () => {
      const initialState = getInitialState();
      const newSessionId = "new-session-456";
      const action: SessionAction = {
        type: "INITIALIZE_SESSION",
        payload: { sessionId: newSessionId },
      };

      const newState = sessionReducer(initialState, action);

      expect(newState.id).toBe(newSessionId);
      expect(newState.isToggled).toBe(false);
      expect(newState.createdAt).toBeGreaterThan(0);
      expect(newState.updatedAt).toBe(newState.createdAt);
    });

    it("should handle GET_STATE action without changing state", () => {
      const initialState = getInitialState();
      const action: SessionAction = {
        type: "GET_STATE",
        payload: { userId: "user-123" },
      };

      const newState = sessionReducer(initialState, action);

      expect(newState).toEqual(initialState);
      expect(newState).toBe(initialState); // Same reference for read operations
    });

    it("should maintain immutability", () => {
      const initialState = getInitialState();
      const action: SessionAction = {
        type: "TOGGLE_SWITCH",
        payload: { userId: "user-123" },
      };

      const newState = sessionReducer(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(initialState.isToggled).toBe(false); // Original state unchanged
      expect(newState.isToggled).toBe(true);
    });
  });

  describe("SessionActionSchema validation", () => {
    it("should validate TOGGLE_SWITCH action", () => {
      const action = {
        type: "TOGGLE_SWITCH",
        payload: { userId: "user-123" },
      };

      const result = SessionActionSchema.safeParse(action);
      expect(result.success).toBe(true);
    });

    it("should validate INITIALIZE_SESSION action", () => {
      const action = {
        type: "INITIALIZE_SESSION",
        payload: { sessionId: "session-123" },
      };

      const result = SessionActionSchema.safeParse(action);
      expect(result.success).toBe(true);
    });

    it("should validate GET_STATE action", () => {
      const action = {
        type: "GET_STATE",
        payload: { userId: "user-123" },
      };

      const result = SessionActionSchema.safeParse(action);
      expect(result.success).toBe(true);
    });

    it("should reject invalid action type", () => {
      const action = {
        type: "INVALID_ACTION",
        payload: { userId: "user-123" },
      };

      const result = SessionActionSchema.safeParse(action);
      expect(result.success).toBe(false);
    });

    it("should reject action with missing payload", () => {
      const action = {
        type: "TOGGLE_SWITCH",
      };

      const result = SessionActionSchema.safeParse(action);
      expect(result.success).toBe(false);
    });

    it("should reject action with invalid payload structure", () => {
      const action = {
        type: "TOGGLE_SWITCH",
        payload: { invalidField: "value" },
      };

      const result = SessionActionSchema.safeParse(action);
      expect(result.success).toBe(false);
    });
  });
});