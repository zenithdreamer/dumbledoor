"use client";

import React, { useEffect, useRef } from "react";

import { trpc } from "~/trpc/react";

interface Keycard {
  id: string;
  level: number;
  position: { x: number; y: number };
  width: number;
  height: number;
}

interface DoorProps {
  isOpen: boolean;
  position: "left" | "right";
}

const Door = ({ isOpen, position }: DoorProps) => {
  const transform = isOpen
    ? position === "left"
      ? "translateX(-100px)"
      : "translateX(100px)"
    : "translateX(0) rotateY(0deg)";

  return (
    <div
      style={{
        width: "200px",
        height: "300px",
        backgroundColor: "darkgray",
        border: "3px solid gray",
        position: "relative",
        cursor: "pointer",
        transform: transform,
        transition: "transform 0.5s ease",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p>{isOpen ? "The door is open." : "The door is closed."}</p>
      </div>
    </div>
  );
};

interface ScannerProps {
  door_id: string;
  keycards: Keycard[];
  scannerLevel: number;
  onScan: (isScanned: boolean) => void;
}

const Scanner: React.FC<ScannerProps> = ({
  door_id,
  keycards,
  scannerLevel,
  onScan,
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const requestLock = trpc.door.scanner_naja.requestLock.useMutation();
  const requestSent = React.useRef(false);

  useEffect(() => {
    const checkCardAccess = async () => {
      if (scannerRef.current) {
        const scannerElement = scannerRef.current;
        const scannerPosition = {
          x: scannerElement.offsetLeft,
          y: scannerElement.offsetTop,
        };
        const scannerSize = {
          width: scannerElement.offsetWidth,
          height: scannerElement.offsetHeight,
        };

        for (const keycard of keycards) {
          const isCardOnScanner =
            keycard.position.x + keycard.width >= scannerPosition.x &&
            keycard.position.x <= scannerPosition.x + scannerSize.width &&
            keycard.position.y + keycard.height >= scannerPosition.y &&
            keycard.position.y <= scannerPosition.y + scannerSize.height;

          if (isCardOnScanner) {
            if (requestSent.current) return; // Prevent sending multiple requests
            console.log("Sending request to lock for Keycard ID:", keycard.id);
            requestSent.current = true;
            try {
              const accessGranted = await requestLock.mutateAsync({
                cardId: keycard.id,
                doorId: door_id,
              });

              console.log("API Response: Access Granted:", accessGranted);

              if (accessGranted) {
                onScan(true);
              } else {
                onScan(false);
              }
            } catch (error) {
              onScan(false);
            }
            return;
          } else {
            requestSent.current = false;
          }
        }

        onScan(false);
      }
    };

    checkCardAccess();
  }, [keycards, scannerLevel, onScan, requestLock, door_id]);

  return (
    <div
      ref={scannerRef}
      style={{
        width: "100px",
        height: "100px",
        backgroundColor: "lightblue",
        border: "3px solid blue",
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
        borderRadius: "5px",
        userSelect: "none",
      }}
    >
      <p style={{ margin: 0, color: "black" }}>Scanner Level {scannerLevel}</p>
    </div>
  );
};

export default function FunctionalDoors({
  doorid,
  keycards,
  doorName,
  level,
}: {
  keycards: Keycard[];
  level: number;
  doorName: string;
  doorid: string;
}) {
  const [areDoorsOpen, setDoorsOpen] = React.useState(false);

  const handleScan = (canAccess: boolean) => {
    setDoorsOpen(canAccess);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ marginBottom: "10px", fontSize: "1.5rem", color: "black" }}>
        {doorName}
      </h3>

      <div style={{ display: "flex", position: "relative" }}>
        <Door isOpen={areDoorsOpen} position="left" />
        <Door isOpen={areDoorsOpen} position="right" />
      </div>

      <Scanner
        door_id={doorid}
        keycards={keycards}
        scannerLevel={level}
        onScan={handleScan}
      />
    </div>
  );
}
