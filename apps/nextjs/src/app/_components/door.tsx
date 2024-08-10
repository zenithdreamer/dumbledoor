"use client";

import React, { useState } from 'react';

const Door = ({ isOpen, toggle, position }: { isOpen: boolean; toggle: () => void; position: 'left' | 'right' }) => {
  const transform = isOpen
    ? (position === 'left' ? 'translateX(-100px)' : 'translateX(100px)')
    : 'translateX(0) rotateY(0deg)';
  
  return (
    <div
      onClick={toggle}
      style={{
        width: '200px',
        height: '300px',
        backgroundColor: 'darkgray',
        border: '3px solid gray',
        position: 'relative',
        cursor: 'pointer',
        transform: transform,
        transition: 'transform 0.5s ease',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <p>{isOpen ? 'The door is open.' : 'The door is closed.'}</p>
      </div>
    </div>
  );
};


const Scanner = () => (
  <div
    style={{
      width: '100px',
      height: '100px',
      backgroundColor: 'lightblue',
      border: '3px solid blue',
      position: 'absolute',
      bottom: '-110px',
      left: '50%',
      transform: 'translateX(-50%)',
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

export default function FunctionalDoors() {
  const [areDoorsOpen, setDoorsOpen] = useState(false);

  const toggleDoors = () => {
    setDoorsOpen(prev => !prev);
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Door isOpen={areDoorsOpen} toggle={toggleDoors} position="left" />
      <Door isOpen={areDoorsOpen} toggle={toggleDoors} position="right" />
      <Scanner />
    </div>
  );
}
