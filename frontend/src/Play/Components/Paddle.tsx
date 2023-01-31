import React from 'react';
import { getBrowserSize, getAspects } from "./helpers";

function Paddle({ y, isLeft } : {y: number, isLeft: boolean}) {
    const screenHeight = getBrowserSize().y;
    const screenWidth = getBrowserSize().x;
    const paddleHeight = screenHeight * 0.1;
    const paddleWidth = paddleHeight * 0.15;
    const halfPaddleHeight = paddleHeight / 2;
    y *= getAspects().aspecty;
    //console.log("y-value: ", y)
    return (
        <div
            style={{
                position: 'absolute',
                left: isLeft ? `${paddleWidth * 2}px` : `${ screenWidth - paddleWidth * 3}px`,
                top: `${y - halfPaddleHeight}px`,
                width: `${paddleWidth}px`,
                height: `${paddleHeight}px`,
                backgroundColor: 'yellow',
            }}
        />
    )
}
export default Paddle;