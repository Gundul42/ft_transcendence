import React from 'react';
import { getBrowserSize } from './helpers';

function Ball({ x, y }) {
  const aspect = getBrowserSize().x / getBrowserSize().y;
  const r = 8 * aspect;
  x *= aspect;
  y *= aspect;
  console.log(x, y);
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

export default Ball;
