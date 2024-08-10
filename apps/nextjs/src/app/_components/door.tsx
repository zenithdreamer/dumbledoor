"use client";

import React, { useEffect, useRef } from 'react';

interface DoorProps {
  isOpen: boolean;
  position: 'left' | 'right';
}

const Door = ({ isOpen, position }: DoorProps) => {
  const transform = isOpen
    ? position === 'left'
      ? 'translateX(-100px)'
      : 'translateX(100px)'
    : 'translateX(0) rotateY(0deg)';

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
  keycardPosition: { x: number; y: number };
  onScan: (isScanned: boolean) => void;
}

const Scanner = ({ keycardPosition, onScan }: ScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scannerRef.current) {
      const rect = scannerRef.current.getBoundingClientRect();
      const scannerPosition = { x: rect.left, y: rect.top };
      const scannerSize = { width: rect.width, height: rect.height };

      const isCardOnScanner =
        keycardPosition.x >= scannerPosition.x &&
        keycardPosition.x <= scannerPosition.x + scannerSize.width &&
        keycardPosition.y >= scannerPosition.y &&
        keycardPosition.y <= scannerPosition.y + scannerSize.height;

      console.log(keycardPosition.x, keycardPosition.y, scannerPosition.x, scannerPosition.y);
      onScan(isCardOnScanner);
    }
  }, [keycardPosition, onScan]);

  return (
    <div
      ref={scannerRef}
      style={{
        width: '100px',
        height: '100px',
        backgroundColor: 'lightblue',
        border: '3px solid blue',
        marginTop: '20px', // Add margin to position scanner below the doors
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '5px',
        userSelect: 'none',
      }}
    >
      <p style={{ margin: 0, color: 'black' }}>Scanner</p>
    </div>
  );
};

export default function FunctionalDoors({ keycardPosition }: { keycardPosition: { x: number; y: number } }) {
  const [areDoorsOpen, setDoorsOpen] = React.useState(false);

  const handleScan = (isScanned: boolean) => {
    setDoorsOpen(isScanned);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', position: 'relative' }}>
        <Door isOpen={areDoorsOpen} position="left" />
        <Door isOpen={areDoorsOpen} position="right" />
      </div>
      <Scanner keycardPosition={keycardPosition} onScan={handleScan} />
    </div>
  );
}
