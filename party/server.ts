import type * as Party from "partykit/server";
import { sessionReducer, createInitialState, SessionActionSchema, type SessionState, type SessionAction } from "../lib/session";

export default class BrktServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection) {
    console.log(`User ${conn.id} connected to room ${this.room.id}`);
    
    // Get or create session state
    let state = await this.room.storage.get<SessionState>("state");
    if (!state) {
      state = createInitialState(this.room.id);
      await this.room.storage.put("state", state);
    }

    // Send current state to newly connected user
    conn.send(JSON.stringify({ 
      type: "state_update", 
      state,
      userId: conn.id,
      timestamp: Date.now()
    }));
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);
      
      // Validate action with Zod
      const actionResult = SessionActionSchema.safeParse(data);
      if (!actionResult.success) {
        console.error("Invalid action format:", actionResult.error);
        return;
      }

      const action: SessionAction = actionResult.data;
      
      // Get current state
      let state = await this.room.storage.get<SessionState>("state");
      if (!state) {
        state = createInitialState(this.room.id);
      }

      // Apply action to state
      const newState = sessionReducer(state, action);
      
      // Save updated state
      await this.room.storage.put("state", newState);

      // Broadcast state update to all connected clients
      this.room.broadcast(
        JSON.stringify({
          type: "state_update",
          state: newState,
          action,
          fromUserId: sender.id,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  onClose(connection: Party.Connection) {
    console.log(`User ${connection.id} disconnected`);
  }

  onError(connection: Party.Connection, error: Error) {
    console.error(`Connection error for ${connection.id}:`, error);
  }
}