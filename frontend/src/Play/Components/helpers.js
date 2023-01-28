import React from 'react'

export function setWindowSizeLimit() {
  const minWidth = 800;
  const minHeight = 600;
  if (window.innerWidth < minWidth || window.innerHeight < minHeight) {
    window.resizeTo(minWidth, minHeight);
  }
}

 export const getBrowserSize = () => {
    let x = window.innerWidth;
    let y = window.innerHeight;
    if (x < 800)
        x = 800;
    if (y < 600)
        y = 600;
    return {x, y};
};
