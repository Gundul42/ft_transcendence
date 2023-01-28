import React from 'react'
import * as fixed from '../../constants';

export function setWindowSizeLimit() {
  const minWidth = 800;
  const minHeight = 600;
  if (window.innerWidth < minWidth || window.innerHeight < minHeight) {
    window.resizeTo(minWidth, minHeight);
  }
};

 export const getBrowserSize = () => {
    let x = window.innerWidth;
    let y = window.innerHeight;
    console.log(x,y);
    return {x, y};
};

export const getAspects = () => {
  const aspectx = fixed.playFieldXMaxSize / getBrowserSize().x;
  const aspecty = fixed.playFieldYMaxSize / getBrowserSize().y;
  const aspect = getBrowserSize().x / getBrowserSize().y;

  return {aspectx, aspecty, aspect};
};