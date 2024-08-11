"use client";

import React, { useEffect, useRef } from "react";

interface Keycard {
  level: number;
  position: { x: number; y: number };
  width: number;  // Added width
  height: number; // Added height
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
  keycards: Keycard[];
  scannerLevel: number;
  onScan: (isScanned: boolean) => void;
}
const Scanner = ({ keycards, scannerLevel, onScan }: ScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

      const canAccess = keycards.some((keycard) => {
        const isCardOnScanner =
          keycard.position.x + keycard.width >= scannerPosition.x &&
          keycard.position.x <= scannerPosition.x + scannerSize.width &&
          keycard.position.y + keycard.height >= scannerPosition.y &&
          keycard.position.y <= scannerPosition.y + scannerSize.height;

        console.log("scanner: ", scannerPosition.x, scannerPosition.y);
        console.log("keycard: ", keycard.position.x, keycard.position.y);
        console.log("isCardOnScanner: ", isCardOnScanner);

        return isCardOnScanner && keycard.level >= scannerLevel;
      });

      onScan(canAccess);
    }
  }, [keycards, scannerLevel, onScan]);

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
  keycards,
  doorName,
  level,
}: {
  keycards: Keycard[];
  level: number;
  doorName: string;  // Added prop for door name
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
      <h3 style={{ marginBottom: "10px", fontSize: "1.5rem", color: "black" }}>{doorName}</h3> 

      <div style={{ display: "flex", position: "relative" }}>
        <Door isOpen={areDoorsOpen} position="left" />
        <Door isOpen={areDoorsOpen} position="right" />
      </div>
      <Scanner keycards={keycards} scannerLevel={level} onScan={handleScan} />
    </div>
  );
}
