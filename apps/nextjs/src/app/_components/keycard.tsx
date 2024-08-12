"use client";

import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "~/trpc/react";

interface MovableKeycardProps {
  name: string;
  role: string;
  id: string;
  level: number;
  onMove: (position: { x: number; y: number }) => void;
}

export default function MovableKeycard({
  name,
  role,
  id,
  level,
  onMove,
}: MovableKeycardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    console.log("card: ", position.x, position.y);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        const newPos = {
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        };
        setPosition(newPos);
        onMove(newPos);
      }
    },
    [dragging, offset, onMove],
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  const { data: doors, isLoading: isDoorsLoading, error: doorsError } =
    trpc.door.admin.getAllDoors.useQuery();

  const accessibleDoors = doors?.filter((door) => door.access_level <= level);

  return (
    <div
      className="rounded-lg bg-yellow-500 p-4 shadow-md"
      style={{
        position: "absolute",
        top: `${position.y}px`,
        left: `${position.x}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        cursor: dragging ? "move" : "default",
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
    >
      <p className="text-base font-bold">{name}</p>
      <p className="text-base">{role}</p>
      <p className="text-lg font-bold" style={{ marginTop: "10px" }}>
        Level: {level}
      </p>
      <div style={{ marginTop: "10px" }}>
        <p className="text-sm font-bold">Accessible Doors:</p>
        {isDoorsLoading && <p>Loading doors...</p>}
        {doorsError && <p>Error loading doors: {doorsError.message}</p>}
        {accessibleDoors && accessibleDoors.length > 0 ? (
          <ul className="text-sm">
            {accessibleDoors.map((door) => (
              <li key={door.id}>{door.name}</li>
            ))}
          </ul>
        ) : (
          <p>No accessible doors.</p>
        )}
      </div>
    </div>
  );
}
