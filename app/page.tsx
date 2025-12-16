"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createSession = () => {
    setIsCreating(true);
    const sessionId = nanoid();
    router.push(`/session/${sessionId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">BRKT Multiplayer Starter</CardTitle>
          <CardDescription>
            Create a new multiplayer session to get started with real-time collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={createSession}
            disabled={isCreating}
            className="w-full"
            size="lg"
          >
            {isCreating ? "Creating..." : "Create Session"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}