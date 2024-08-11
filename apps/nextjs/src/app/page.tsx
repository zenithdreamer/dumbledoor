"use client";

import React, { useState } from "react";
import Link from "next/link";
import FunctionalDoors from "./_components/door";
import MovableKeycard from "./_components/keycard";
import { DoorTRPCReactProvider, trpc } from "~/trpc/react";

const Doortable: React.FC = () => {
  const { data: doors, isLoading, error } = trpc.door.admin.getAllDoors.useQuery();
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);
  const [keycards, setKeycards] = useState([
    { level: 4, position: { x: 0, y: 0 }, width: 200, height: 120 }, // Added width and height
    { level: 2, position: { x: 0, y: 0 }, width: 200, height: 120 }, // Added width and height
  ]);

  const updateKeycardPosition = (index: number, position: { x: number; y: number }) => {
    setKeycards(prevKeycards =>
      prevKeycards.map((keycard, i) =>
        i === index ? { ...keycard, position } : keycard
      )
    );
  };

  const handleDoorSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoorId(event.target.value);
  };

  const selectedDoor = doors?.find(door => door.id === selectedDoorId);

  return (
    <main className="container relative h-screen py-16">
      <Link
        href="/login"
        className="absolute right-4 top-4 rounded bg-blue-500 px-4 py-2 text-white shadow-lg transition-colors duration-300 hover:bg-blue-600"
      >
        Login
      </Link>

      <div className="flex flex-col items-center justify-center gap-4">
        {isLoading && <p>Loading doors...</p>}
        {error && <p>Error loading doors: {error.message}</p>}

        {doors && (
          <select
            onChange={handleDoorSelect}
            value={selectedDoorId || ''}
            className="mb-4 p-2 border rounded"
          >
            <option value="" disabled>Select a door</option>
            {doors.map((door) => (
              <option key={door.id} value={door.id}>
                {door.name}
              </option>
            ))}
          </select>
        )}

        {selectedDoor && (
          <div className="flex items-center justify-center h-full">
            <FunctionalDoors
              keycards={keycards}
              level={selectedDoor.access_level}
              doorName={selectedDoor.name}
              key={selectedDoor.id}
            />
          </div>
        )}

        {keycards.map((keycard, index) => (
          <MovableKeycard
            key={index}
            name={index === 0 ? "John Doe" : "Thong Smith"}
            role={index === 0 ? "SCP Manager" : "SCP Catcher"}
            id={index === 0 ? "65011353" : "65012333"}
            level={keycard.level}
            width={keycard.width} // Passing width
            height={keycard.height} // Passing height
            onMove={(pos) => updateKeycardPosition(index, pos)}
          />
        ))}
      </div>
    </main>
  );
};

export default function HomePage() {
  return (
    <DoorTRPCReactProvider>
      <Doortable />
    </DoorTRPCReactProvider>
  );
}
