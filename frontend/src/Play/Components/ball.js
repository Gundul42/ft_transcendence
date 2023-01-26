import React from 'react';

function Ball({ x, y, r }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${r}px`,
        height: `${r}px`,
        borderRadius: '50%',
        backgroundColor: 'red',
      }}
    />
  );
}

export default Circle;
