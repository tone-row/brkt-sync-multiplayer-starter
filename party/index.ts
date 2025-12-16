import { Server, type Connection } from "partyserver";

export class BrktServer extends Server {
  constructor(public room: Record<string, unknown>) {
    super(room, {});
  }

  onConnect(connection: Connection) {
    console.log(`User ${connection.id} connected to room ${this.room.id}`);
    
    // Send initial state to newly connected user
    connection.send(JSON.stringify({ 
      type: "connected", 
      userId: connection.id,
      roomId: this.room.id,
      timestamp: Date.now()
    }));
  }

  onMessage(connection: Connection, message: string) {
    try {
      const data = JSON.parse(message);
      
      // Broadcast message to all connected clients except sender
      this.broadcast(
        JSON.stringify({
          ...data,
          fromUserId: connection.id,
          timestamp: Date.now()
        }),
        [connection.id]
      );
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  onClose(connection: Connection) {
    console.log(`User ${connection.id} disconnected from room ${this.room.id}`);
  }

  onError(connection: Connection, error: Error) {
    console.error(`Connection error for ${connection.id}:`, error);
  }
}

const server = {
  BrktServer: BrktServer,
};

export default server;