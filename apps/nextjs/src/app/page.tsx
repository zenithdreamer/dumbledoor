"use client";

import MovableKeycard from "./_components/keycard";
import FunctionalDoors from "./_components/door";
import React, { useState } from "react";

export default function HomePage() {
  const [keycardPosition, setKeycardPosition] = useState({ x: 0, y: 0 });

  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <FunctionalDoors keycardPosition={keycardPosition} />
        <MovableKeycard
          name="John Doe"
          role="SCP Manager"
          id="65011353"
          level={3}
          onMove={(pos) => setKeycardPosition(pos)}
        />
      </div>
    </main>
  );
}
