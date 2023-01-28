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
  const aspectx = getBrowserSize().x / fixed.playFieldXMaxSize;
  const aspecty = getBrowserSize().y / fixed.playFieldYMaxSize;
  const aspect = getBrowserSize().y / getBrowserSize().x;

  return {aspectx, aspecty, aspect};
};