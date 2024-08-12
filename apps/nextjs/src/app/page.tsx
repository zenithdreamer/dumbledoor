"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DoorTRPCReactProvider, trpc } from "~/trpc/react";
import FunctionalDoors from "./_components/door";
import MovableKeycard from "./_components/keycard";

const Doortable: React.FC = () => {
  const searchParams = useSearchParams();
  const [retrievedCardId, setRetrievedCardId] = useState<string | null>(null);

  useEffect(() => {
    const cardId = searchParams.get("retrive_card");
    if (cardId) {
      setRetrievedCardId(cardId);
    }
  }, [searchParams]);

  const {
    data: cards,
    isLoading: isCardsLoading,
    error: cardsError,
  } = trpc.card.admin.getAllCards.useQuery();

  const {
    data: doors,
    isLoading: isDoorsLoading,
    error: doorsError,
  } = trpc.door.admin.getAllDoors.useQuery();

  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);
  const [keycards, setKeycards] = useState([
    { level: 4, position: { x: 0, y: 0 }, width: 200, height: 120 },
    { level: 2, position: { x: 0, y: 0 }, width: 200, height: 120 },
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

  const handleDoorSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoorId(event.target.value);
  };

  const selectedDoor = doors?.find((door) => door.id === selectedDoorId);

  const selectedCard = cards?.find((card) => card.id === retrievedCardId);

  return (
    <main className="container relative h-screen py-16">
      <Link
        href="/login"
        className="absolute right-4 top-4 rounded bg-blue-500 px-4 py-2 text-white shadow-lg transition-colors duration-300 hover:bg-blue-600"
      >
        Login
      </Link>

      <div className="flex flex-col items-center justify-center gap-4">
        {isDoorsLoading && <p>Loading doors...</p>}
        {doorsError && <p>Error loading doors: {doorsError.message}</p>}

        {doors && (
          <select
            onChange={handleDoorSelect}
            value={selectedDoorId ?? ""}
            className="mb-4 rounded border p-2"
          >
            <option value="" disabled>
              Select a door
            </option>
            {doors.map((door) => (
              <option key={door.id} value={door.id}>
                {door.name}
              </option>
            ))}
          </select>
        )}

        {selectedDoor && (
          <div className="flex h-full items-center justify-center">
            <FunctionalDoors
              keycards={keycards}
              level={selectedDoor.access_level}
              doorName={selectedDoor.name}
              key={selectedDoor.id}
            />
          </div>
        )}

        {isCardsLoading && <p>Loading card data...</p>}
 
        {selectedCard ? (
          <div>
            <MovableKeycard
              key={selectedCard.id}
              name={`${selectedCard.user?.first_name} ${selectedCard.user?.last_name}`}
              role={selectedCard.access?.role?.name ?? "No role"}
              id={selectedCard.user?.id ?? "Unknown ID"}
              level={2}
              width={200} 
              height={120} 
              onMove={(pos) => updateKeycardPosition(0, pos)}
            />
            <div className="mt-4">
              <Link
                href="/admin" 
                className="rounded bg-blue-500 px-4 py-2 text-white shadow-lg transition-colors duration-300 hover:bg-blue-600"
              >
                Select another Cards
              </Link>
            </div>
          </div>
        ) : (
          <p>No matching card found or card not selected.</p>
        )}
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
