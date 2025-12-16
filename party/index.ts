import { Server } from "partyserver";
import { sessionReducer, createInitialState, SessionActionSchema, type SessionState, type SessionAction } from "../lib/session";

export class BrktServer extends Server {
  sessionState: SessionState | null = null;

  constructor(public room: any) {
    super(room, {});
  }

  async onConnect(connection: any) {
    console.log(`User ${connection.id} connected to room ${this.room.id}`);
    
    // Initialize session state if it doesn't exist
    if (!this.sessionState) {
      this.sessionState = createInitialState(this.room.id);
    }

    // Send current state to newly connected user
    connection.send(JSON.stringify({ 
      type: "state_update", 
      state: this.sessionState,
      userId: connection.id,
      timestamp: Date.now()
    }));
  }

  async onMessage(connection: any, message: string) {
    try {
      const data = JSON.parse(message);
      
      // Validate action with Zod
      const actionResult = SessionActionSchema.safeParse(data);
      if (!actionResult.success) {
        console.error("Invalid action format:", actionResult.error);
        return;
      }

      const action: SessionAction = actionResult.data;
      
      // Initialize state if it doesn't exist
      if (!this.sessionState) {
        this.sessionState = createInitialState(this.room.id);
      }

      // Apply action to state
      this.sessionState = sessionReducer(this.sessionState, action);

      // Broadcast state update to all connected clients
      this.broadcast(
        JSON.stringify({
          type: "state_update",
          state: this.sessionState,
          action,
          fromUserId: connection.id,
          timestamp: Date.now()
        }),
        [connection.id]
      );
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  onClose(connection: any) {
    console.log(`User ${connection.id} disconnected from room ${this.room.id}`);
  }

  onError(connection: any, error: Error) {
    console.error(`Connection error for ${connection.id}:`, error);
  }
}

// Export for Cloudflare Workers
export default {
  fetch(request: Request, env: any) {
    return new Response("Party Server is running", { status: 200 });
  },
};