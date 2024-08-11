"use client";

import React, { useState } from "react";
import Link from "next/link";

import FunctionalDoors from "./_components/door";
import MovableKeycard from "./_components/keycard";

export default function HomePage() {
  const [keycardPosition, setKeycardPosition] = useState({ x: 0, y: 0 });

  return (
    <main className="container relative h-screen py-16">
      <Link
        href="/login"
        className="absolute right-4 top-4 rounded bg-blue-500 px-4 py-2 text-white shadow-lg transition-colors duration-300 hover:bg-blue-600"
      >
        Login
      </Link>

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
