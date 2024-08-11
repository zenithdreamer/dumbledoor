"use client";

import React, { useState } from "react";
import Link from "next/link";

import FunctionalDoors from "./_components/door";
import MovableKeycard from "./_components/keycard";

export default function HomePage() {
  const [keycards, setKeycards] = useState([
    { level: 4, position: { x: 0, y: 0 } },
    { level: 2, position: { x: 0, y: 0 } },
  ]);

  const updateKeycardPosition = (
    index: number,
    position: { x: number; y: number },
  ) => {
    setKeycards((prevKeycards) =>
      prevKeycards.map((keycard, i) =>
        i === index ? { ...keycard, position } : keycard,
      ),
    );
  };

  return (
    <main className="container relative h-screen py-16">
      <Link
        href="/login"
        className="absolute right-4 top-4 rounded bg-blue-500 px-4 py-2 text-white shadow-lg transition-colors duration-300 hover:bg-blue-600"
      >
        Login
      </Link>

      <div className="flex flex-col items-center justify-center gap-4">
        <FunctionalDoors keycards={keycards} level={1} />
        <FunctionalDoors keycards={keycards} level={2} />
        <FunctionalDoors keycards={keycards} level={3} />
        <FunctionalDoors keycards={keycards} level={4} />
        <FunctionalDoors keycards={keycards} level={5} />
        {keycards.map((keycard, index) => (
          <MovableKeycard
            key={index}
            name={index === 0 ? "John Doe" : "Thong Smith"}
            role={index === 0 ? "SCP Manager" : "SCP Catcher"}
            id={index === 0 ? "65011353" : "65012333"}
            level={keycard.level}
            onMove={(pos) => updateKeycardPosition(index, pos)}
          />
        ))}
      </div>
    </main>
  );
}
