"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { usePartySocket } from "partysocket/react";
import { useUserId } from "@/hooks/useUserId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { SessionState, SessionAction } from "@/lib/session";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const userId = useUserId();
  const [sessionState, setSessionState] = useState<SessionState | null>(null);

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999",
    room: sessionId,
    id: userId!,
    startClosed: !userId,
    onMessage(event) {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "state_update") {
          setSessionState(data.state);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    },
    onOpen() {
      console.log("Connected to session:", sessionId);
    },
    onClose() {
      console.log("Disconnected from session:", sessionId);
    },
  });

  const handleToggle = () => {
    if (!userId || !socket) return;

    const action: SessionAction = {
      type: "TOGGLE_SWITCH",
      payload: { userId },
    };

    socket.send(JSON.stringify(action));
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading user...</div>
      </div>
    );
  }

  if (!sessionState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Session Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Multiplayer Session</h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">Session: {sessionId.slice(0, 8)}...</Badge>
            <Badge variant="outline">User: {userId.slice(0, 8)}...</Badge>
          </div>
        </div>

        {/* Main Controls */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Shared Toggle Switch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="shared-toggle"
                checked={sessionState.isToggled}
                onCheckedChange={handleToggle}
              />
              <Label htmlFor="shared-toggle" className="font-medium">
                {sessionState.isToggled ? "On" : "Off"}
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              This switch is synchronized across all users in real-time.
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Created:</strong> {new Date(sessionState.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Last Updated:</strong> {new Date(sessionState.updatedAt).toLocaleString()}
            </div>
            <div>
              <strong>Connection Status:</strong>{" "}
              <Badge variant={socket?.readyState === 1 ? "default" : "destructive"}>
                {socket?.readyState === 1 ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}