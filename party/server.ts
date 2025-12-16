import type * as Party from "partykit/server";

export default class BrktServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    console.log(`User ${conn.id} connected`);
    
    // Send initial state to newly connected user
    conn.send(JSON.stringify({ 
      type: "connected", 
      userId: conn.id,
      timestamp: Date.now()
    }));
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);
      
      // Broadcast message to all connected clients except sender
      this.room.broadcast(
        JSON.stringify({
          ...data,
          fromUserId: sender.id,
          timestamp: Date.now()
        }),
        [sender.id]
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